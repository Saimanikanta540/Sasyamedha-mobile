from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DestinationResponse(BaseModel):
    id: UUID
    name: str
    address: str
    lat: float
    lng: float
    crops_accepted: list[str]
    min_quantity_kg: Optional[float] = None
    max_quantity_kg: Optional[float] = None
    indicative_price_per_kg: Optional[float] = None
    phone: Optional[str] = None
    verified: bool
    distance_km: Optional[float] = None
