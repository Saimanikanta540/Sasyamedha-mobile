from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Scan(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    image_url: str
    disease_class: str
    confidence: float
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
