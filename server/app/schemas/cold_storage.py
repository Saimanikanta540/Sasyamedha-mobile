from uuid import UUID
from pydantic import BaseModel

class ColdStorageResponse(BaseModel):
    id: UUID
    name: str
    latitude: float
    longitude: float
    total_capacity_kg: float
    available_capacity_kg: float
    utilization_percentage: float
    supported_crops: list[str]
    cost_per_kg_per_day: float
    contact_phone: str | None = None
    distance_km: float | None = None
