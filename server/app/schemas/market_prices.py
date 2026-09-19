from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

class MandiPriceResponse(BaseModel):
    commodity: str
    variety: str
    state: str
    district: str
    market: str
    min_price: float
    max_price: float
    modal_price: float
    min_price_per_kg: float
    max_price_per_kg: float
    modal_price_per_kg: float
    price_date: date
    ingested_at: datetime
    distance_km: Optional[float] = None
