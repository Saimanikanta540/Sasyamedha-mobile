from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Scan(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    image_url: str
    disease_class: str
    confidence: float
    # True only for the last-resort hardcoded fallback (no trained model, no
    # Gemini key/response) — see services/ml_inference.py. Never hide this from
    # the client, same principle as the web PWA's demo-model chip.
    is_mock: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
