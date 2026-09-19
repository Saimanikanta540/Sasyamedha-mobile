from typing import Optional
from uuid import UUID
from pydantic import BaseModel

class SellSmartRequest(BaseModel):
    commodity: str
    quantity_kg: float
    farmer_lat: float
    farmer_lng: float
    storage_days: Optional[int] = 0

class CostBreakdown(BaseModel):
    gross_revenue: float
    transport_cost: float
    storage_cost: float
    net_return: float
    delta_from_best: float

class SellSmartDestination(BaseModel):
    destination_id: UUID
    type: str
    name: str
    distance_km: float
    price_per_kg: float
    breakdown: CostBreakdown

class SellSmartResponse(BaseModel):
    results: list[SellSmartDestination]
