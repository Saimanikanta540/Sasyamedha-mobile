from uuid import UUID, uuid4

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class ColdStorage(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    latitude: float
    longitude: float
    total_capacity_kg: float
    available_capacity_kg: float
    supported_crops: list[str] = Field(sa_column=Column(JSON))
    cost_per_kg_per_day: float
    contact_phone: str | None = None
