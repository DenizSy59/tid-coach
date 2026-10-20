from fastapi.testclient import TestClient

from app.api.routes.translate import MAX_UPLOAD_BYTES
from app.core.config import settings

# The first bytes real files start with, so the server can tell them apart
# without trusting the name or the content type the browser sends.
MP4_HEADER = b"\x00\x00\x00\x18ftypmp42"
WEBM_HEADER = b"\x1a\x45\xdf\xa3"
GIF_HEADER = b"GIF89a"


def upload(
    client: TestClient,
    headers: dict[str, str],
    content: bytes,
    filename: str = "sign.mp4",
    content_type: str = "video/mp4",
):
    return client.post(
        f"{settings.API_V1_STR}/translate/video",
        headers=headers,
        files={"file": (filename, content, content_type)},
    )


def test_accepts_mp4(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    response = upload(client, normal_user_token_headers, MP4_HEADER + b"\x00" * 512)
    assert response.status_code == 200
    # The model is not connected yet, so there are no guesses.
    assert response.json() == {"data": []}


def test_accepts_webm(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    response = upload(
        client,
        normal_user_token_headers,
        WEBM_HEADER + b"\x00" * 512,
        filename="sign.webm",
        content_type="video/webm",
    )
    assert response.status_code == 200


def test_rejects_a_file_that_is_not_a_video(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    response = upload(client, normal_user_token_headers, GIF_HEADER + b"\x00" * 512)
    assert response.status_code == 415
    assert response.json()["detail"] == "Only MP4 and WebM videos are accepted"


def test_rejects_a_file_that_lies_about_its_type(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    """A GIF called sign.mp4 and sent as video/mp4 must still be refused."""
    response = upload(
        client,
        normal_user_token_headers,
        GIF_HEADER + b"\x00" * 512,
        filename="sign.mp4",
        content_type="video/mp4",
    )
    assert response.status_code == 415


def test_rejects_an_empty_file(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    response = upload(client, normal_user_token_headers, b"")
    assert response.status_code == 400
    assert response.json()["detail"] == "The video is empty"


def test_rejects_a_video_that_is_too_large(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    too_big = MP4_HEADER + b"\x00" * (MAX_UPLOAD_BYTES + 1 - len(MP4_HEADER))
    response = upload(client, normal_user_token_headers, too_big)
    assert response.status_code == 413
    assert response.json()["detail"] == "The video is too large"


def test_a_dangerous_file_name_is_not_used(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    """The name the browser sends is ignored, so path tricks cannot escape."""
    response = upload(
        client,
        normal_user_token_headers,
        MP4_HEADER + b"\x00" * 512,
        filename="../../etc/passwd",
    )
    assert response.status_code == 200


def test_upload_needs_login(client: TestClient) -> None:
    response = client.post(
        f"{settings.API_V1_STR}/translate/video",
        files={"file": ("sign.mp4", MP4_HEADER, "video/mp4")},
    )
    assert response.status_code == 401
