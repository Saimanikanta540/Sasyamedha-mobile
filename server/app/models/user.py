from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """Device-identity account — no password, ever. Created lazily the first
    time a device calls POST /auth/device."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    device_id: str = Field(unique=True, index=True)
    phone_number: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
