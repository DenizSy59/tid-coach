import uuid
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Annotated, Any

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.api.deps import CurrentUser
from app.ml import predict_from_video
from app.models import SignPredictions

router = APIRouter(prefix="/translate", tags=["translate"])

# A single sign is a few seconds long, so anything larger is not a sign video.
MAX_UPLOAD_BYTES = 20 * 1024 * 1024
CHUNK_SIZE = 1024 * 1024
HEADER_BYTES = 12


def looks_like_video(header: bytes) -> bool:
    """
    Decide the format from the first bytes of the file itself.

    The browser's content type and the file name can both be anything, so
    neither is trusted here.
    """
    # MP4, M4V and MOV all carry an "ftyp" box right after its size.
    if header[4:8] == b"ftyp":
        return True
    # WebM and Matroska start with the EBML marker.
    if header[:4] == b"\x1a\x45\xdf\xa3":
        return True
    return False


@router.post("/video", response_model=SignPredictions)
async def translate_video(
    current_user: CurrentUser,
    file: Annotated[UploadFile, File()],
) -> Any:
    """
    Read a short sign video and return the best guesses.

    The video is never kept. It is written under a name we generate, read by
    the model, and deleted again before this returns, including when the
    model raises.
    """
    with TemporaryDirectory() as temp_dir:
        # Our own name. The one the browser sent is never used, so it cannot
        # contain a path, an extension or anything else surprising.
        target = Path(temp_dir) / f"{uuid.uuid4().hex}.upload"

        size = 0
        header = b""
        with target.open("wb") as buffer:
            while chunk := await file.read(CHUNK_SIZE):
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413, detail="The video is too large"
                    )
                if not header:
                    header = chunk[:HEADER_BYTES]
                buffer.write(chunk)

        if size == 0:
            raise HTTPException(status_code=400, detail="The video is empty")
        if not looks_like_video(header):
            raise HTTPException(
                status_code=415, detail="Only MP4 and WebM videos are accepted"
            )

        predictions = predict_from_video(target)

    return SignPredictions(data=predictions)
