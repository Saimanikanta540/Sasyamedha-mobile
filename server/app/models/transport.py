from datetime import date, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class TransportProvider(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    vehicle_type: str
    capacity_kg: float
    latitude: float
    longitude: float
    rate_per_km: float | None = None
    flat_route_rate: float | None = None
    contact_phone: str


class TransportRequest(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    reference_number: str = Field(unique=True, index=True)
    pickup_lat: float
    pickup_lng: float
    destination_lat: float
    destination_lng: float
    commodity: str
    quantity_kg: float
    scheduled_date: date
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
