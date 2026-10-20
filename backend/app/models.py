import uuid
from datetime import UTC, datetime

from pydantic import EmailStr
from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(UTC)


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(SQLModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    is_superuser: bool | None = None
    full_name: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime | None = Field(default_factory=get_datetime_utc)
    items: list[Item] = Relationship(back_populates="owner", cascade_delete=True)
    saved_signs: list[SavedSign] = Relationship(
        back_populates="owner", cascade_delete=True
    )
    practice_attempts: list[PracticeAttempt] = Relationship(
        back_populates="owner", cascade_delete=True
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    created_at: datetime | None = None


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(default_factory=get_datetime_utc)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# TİD Coach: the AUTSL sign list has 226 signs, with class ids 0-225
SIGN_ID_MIN = 0
SIGN_ID_MAX = 225


# Shared properties
class SavedSignBase(SQLModel):
    sign_id: int = Field(ge=SIGN_ID_MIN, le=SIGN_ID_MAX, index=True)


# Properties to receive on saving a sign
class SavedSignCreate(SavedSignBase):
    pass


# Database model, database table inferred from class name
class SavedSign(SavedSignBase, table=True):
    __table_args__ = (
        UniqueConstraint("owner_id", "sign_id", name="uq_saved_sign_owner_sign"),
    )

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(default_factory=get_datetime_utc)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="saved_signs")


# Properties to return via API, id is always required
class SavedSignPublic(SavedSignBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class SavedSignsPublic(SQLModel):
    data: list[SavedSignPublic]
    count: int


# Shared properties
class PracticeAttemptBase(SQLModel):
    sign_id: int = Field(ge=SIGN_ID_MIN, le=SIGN_ID_MAX, index=True)
    # Both are filled in by the model later, so they stay empty for now.
    score: float | None = Field(default=None, ge=0, le=100)
    predicted_sign_id: int | None = Field(
        default=None, ge=SIGN_ID_MIN, le=SIGN_ID_MAX
    )


# Properties to receive on recording an attempt
class PracticeAttemptCreate(PracticeAttemptBase):
    pass


# Database model, database table inferred from class name
class PracticeAttempt(PracticeAttemptBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(default_factory=get_datetime_utc)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="practice_attempts")


# Properties to return via API, id is always required
class PracticeAttemptPublic(PracticeAttemptBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime | None = None


class PracticeAttemptsPublic(SQLModel):
    data: list[PracticeAttemptPublic]
    count: int


# How often one sign was practised, and how well
class SignProgress(SQLModel):
    sign_id: int
    times_practised: int
    best_score: float | None = None
    last_practised: datetime | None = None


class SignProgressPublic(SQLModel):
    data: list[SignProgress]
    count: int


# One guess from the sign model
class SignPrediction(SQLModel):
    sign_id: int = Field(ge=SIGN_ID_MIN, le=SIGN_ID_MAX)
    confidence: float = Field(ge=0, le=1)


class SignPredictions(SQLModel):
    data: list[SignPrediction]


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
