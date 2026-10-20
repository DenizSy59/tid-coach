from typing import Any

from fastapi import APIRouter
from sqlmodel import col, func, select

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    PracticeAttempt,
    PracticeAttemptCreate,
    PracticeAttemptPublic,
    PracticeAttemptsPublic,
    SignProgress,
    SignProgressPublic,
)

router = APIRouter(prefix="/practice", tags=["practice"])


@router.get("/attempts", response_model=PracticeAttemptsPublic)
def read_practice_attempts(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve the practice attempts of the current user.
    """
    count_statement = (
        select(func.count())
        .select_from(PracticeAttempt)
        .where(PracticeAttempt.owner_id == current_user.id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(PracticeAttempt)
        .where(PracticeAttempt.owner_id == current_user.id)
        .order_by(col(PracticeAttempt.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    attempts = session.exec(statement).all()

    attempts_public = [
        PracticeAttemptPublic.model_validate(attempt) for attempt in attempts
    ]
    return PracticeAttemptsPublic(data=attempts_public, count=count)


@router.post("/attempts", response_model=PracticeAttemptPublic)
def create_practice_attempt(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    attempt_in: PracticeAttemptCreate,
) -> Any:
    """
    Record one practice attempt for the current user.

    The score and the guessed sign stay empty until the model fills them in.
    """
    return crud.create_practice_attempt(
        session=session, attempt_in=attempt_in, owner_id=current_user.id
    )


@router.get("/progress", response_model=SignProgressPublic)
def read_progress(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Per sign: how many times the current user practised it, the best score and
    when it was last practised.
    """
    statement = (
        select(
            PracticeAttempt.sign_id,
            func.count().label("times_practised"),
            func.max(PracticeAttempt.score).label("best_score"),
            func.max(PracticeAttempt.created_at).label("last_practised"),
        )
        .where(PracticeAttempt.owner_id == current_user.id)
        .group_by(col(PracticeAttempt.sign_id))
        .order_by(col(PracticeAttempt.sign_id))
    )
    rows = session.exec(statement).all()

    progress = [
        SignProgress(
            sign_id=row.sign_id,
            times_practised=row.times_practised,
            best_score=row.best_score,
            last_practised=row.last_practised,
        )
        for row in rows
    ]
    return SignProgressPublic(data=progress, count=len(progress))
