"""
Where the sign-recognition model plugs into the server.

Nothing here is a model. It is the one function the upload route calls, so the
model can be connected by filling it in without touching the API.
"""

from pathlib import Path

from app.models import SignPrediction


def predict_from_video(video_path: Path) -> list[SignPrediction]:
    """
    TODO (Deniz, ML): read the video at ``video_path``, pull the landmarks out
    of it and run the server-side model, then return the best guesses, best
    first.

    The file exists only while this call runs and is deleted straight
    afterwards, so read whatever is needed before returning.

    Returning an empty list means "not sure", which the Translator page
    already shows as a message.
    """
    return []
