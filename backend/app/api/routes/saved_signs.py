from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    SavedSign,
    SavedSignCreate,
    SavedSignPublic,
    SavedSignsPublic,
)

router = APIRouter(prefix="/saved-signs", tags=["saved-signs"])


@router.get("/", response_model=SavedSignsPublic)
def read_saved_signs(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve the signs the current user saved.
    """
    count_statement = (
        select(func.count())
        .select_from(SavedSign)
        .where(SavedSign.owner_id == current_user.id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(SavedSign)
        .where(SavedSign.owner_id == current_user.id)
        .order_by(col(SavedSign.created_at).desc())
        .offset(skip)
        .limit(limit)
    )
    saved_signs = session.exec(statement).all()

    saved_signs_public = [
        SavedSignPublic.model_validate(saved_sign) for saved_sign in saved_signs
    ]
    return SavedSignsPublic(data=saved_signs_public, count=count)


@router.post("/", response_model=SavedSignPublic)
def create_saved_sign(
    *, session: SessionDep, current_user: CurrentUser, saved_sign_in: SavedSignCreate
) -> Any:
    """
    Save a sign for the current user.
    """
    existing = crud.get_saved_sign(
        session=session, owner_id=current_user.id, sign_id=saved_sign_in.sign_id
    )
    if existing:
        raise HTTPException(status_code=409, detail="Sign already saved")
    return crud.create_saved_sign(
        session=session, saved_sign_in=saved_sign_in, owner_id=current_user.id
    )


@router.delete("/{sign_id}")
def delete_saved_sign(
    session: SessionDep, current_user: CurrentUser, sign_id: int
) -> Message:
    """
    Remove a saved sign of the current user.
    """
    saved_sign = crud.get_saved_sign(
        session=session, owner_id=current_user.id, sign_id=sign_id
    )
    if not saved_sign:
        raise HTTPException(status_code=404, detail="Saved sign not found")
    session.delete(saved_sign)
    session.commit()
    return Message(message="Saved sign removed successfully")
