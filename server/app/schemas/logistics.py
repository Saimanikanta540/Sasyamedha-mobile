from datetime import date
from uuid import UUID
from pydantic import BaseModel, Field

class TransportEstimateResponse(BaseModel):
    distance_km: float
    estimated_cost: float

class TransportProviderResponse(BaseModel):
    id: UUID
    name: str
    vehicle_type: str
    capacity_kg: float
    latitude: float
    longitude: float
    rate_per_km: float | None = None
    flat_route_rate: float | None = None
    contact_phone: str
    distance_km: float | None = None

class TransportRequestCreate(BaseModel):
    pickup_lat: float
    pickup_lng: float
    destination_lat: float
    destination_lng: float
    commodity: str
    quantity_kg: float
    scheduled_date: date

class TransportRequestResponse(BaseModel):
    id: UUID
    reference_number: str
    status: str
