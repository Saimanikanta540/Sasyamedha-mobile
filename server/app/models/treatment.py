from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class TreatmentRecord(SQLModel, table=True):
    """Curated, versioned content — never generated at request time (FR-TG-01).
    (disease_class, language) is intentionally NOT unique: versioning means
    multiple rows can exist for the same pair over time, and the read endpoint
    always serves the highest `version`. `created_at` isn't in the original
    brief's schema but costs nothing and makes "highest version" unambiguous
    when two versions share a number during a review workflow.
    """

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    disease_class: str = Field(index=True)
    language: str = Field(index=True)  # 'te' | 'en' | 'hi'
    symptoms: str
    immediate_actions: list[str] = Field(sa_column=Column(JSON))  # ordered
    prevention: str
    indicative_cost_min: float
    indicative_cost_max: float
    version: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
