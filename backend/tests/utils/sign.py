import random

from sqlmodel import Session

from app import crud
from app.models import (
    PracticeAttempt,
    PracticeAttemptCreate,
    SavedSign,
    SavedSignCreate,
)
from tests.utils.user import create_random_user


def random_sign_id() -> int:
    return random.randint(0, 225)


def create_random_saved_sign(db: Session) -> SavedSign:
    user = create_random_user(db)
    owner_id = user.id
    assert owner_id is not None
    saved_sign_in = SavedSignCreate(sign_id=random_sign_id())
    return crud.create_saved_sign(
        session=db, saved_sign_in=saved_sign_in, owner_id=owner_id
    )


def create_random_practice_attempt(db: Session) -> PracticeAttempt:
    user = create_random_user(db)
    owner_id = user.id
    assert owner_id is not None
    attempt_in = PracticeAttemptCreate(sign_id=random_sign_id())
    return crud.create_practice_attempt(
        session=db, attempt_in=attempt_in, owner_id=owner_id
    )
