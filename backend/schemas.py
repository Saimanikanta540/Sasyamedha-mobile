from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


# --- auth / farmer ---
class RegisterRequest(BaseModel):
    phone: str
    name: str
    language: str = "te"
    state: str
    district: str
    village: Optional[str] = None
    lat: float
    lng: float


class LoginRequest(BaseModel):
    phone: str


class FarmerRead(BaseModel):
    id: int
    phone: str
    name: str
    language: str
    state: str
    district: str
    village: Optional[str] = None
    lat: float
    lng: float

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    token: str
    farmer: FarmerRead


class FarmerUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


# --- batches ---
class BatchCreate(BaseModel):
    crop: str
    quantity_kg: float
    lat: float
    lng: float


class BatchRead(BaseModel):
    id: int
    farmer_id: int
    crop: str
    quantity_kg: float
    lat: float
    lng: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- disease / treatments ---
class ScanResult(BaseModel):
    class_key: str
    label: str
    confidence: float
    band: str
    is_mock: bool
    scan_id: int


class ScanRead(BaseModel):
    id: int
    farmer_id: int
    batch_id: Optional[int] = None
    class_key: str
    confidence: float
    band: str
    is_mock: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TreatmentRead(BaseModel):
    class_key: str
    lang: str
    crop: str
    display_name: str
    symptoms: list[str]
    immediate_actions: list[str]
    prevention: list[str]
    indicative_cost_note: str
    disclaimer: str

    class Config:
        from_attributes = True


# --- prices ---
class MarketPriceItem(BaseModel):
    market_id: int
    market_name: str
    market_name_local: str
    district: str
    commodity: str
    variety: Optional[str] = None
    min_price_qtl: float
    max_price_qtl: float
    modal_price_qtl: float
    modal_price_kg: float
    price_date: date
    fetched_at: datetime
    source: str
    distance_km: Optional[float] = None


class PricesResponse(BaseModel):
    fetched_at: datetime
    items: list[MarketPriceItem]


class PriceHistoryPoint(BaseModel):
    date: date
    modal_price_qtl: float


# --- sell smart ---
class SellSmartRequest(BaseModel):
    batch_id: Optional[int] = None
    crop: Optional[str] = None
    quantity_kg: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    storage_days: int = 0


class BreakdownItem(BaseModel):
    label: str
    amount: float
    formula: str


class SellSmartResult(BaseModel):
    rank: int
    destination_type: str
    destination_id: int
    name: str
    name_local: str
    price_per_kg: float
    distance_km: float
    gross: float
    transport_cost: float
    storage_cost: float
    net_return: float
    delta_vs_best: float
    pickup_offered: bool
    phone: str
    verified: bool
    breakdown: list[BreakdownItem]


class SellSmartBatchInfo(BaseModel):
    crop: str
    quantity_kg: float
    lat: float
    lng: float


class SellSmartResponse(BaseModel):
    batch: SellSmartBatchInfo
    estimate_notice: str
    results: list[SellSmartResult]


# --- directory ---
class BuyerRead(BaseModel):
    id: int
    name: str
    crops: list[str]
    min_qty_kg: Optional[float] = None
    max_qty_kg: Optional[float] = None
    indicative_price_qtl: float
    lat: float
    lng: float
    phone: str
    verified: bool
    pickup_offered: bool
    district: str
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True


class FpoRead(BaseModel):
    id: int
    name: str
    crops: list[str]
    services: list[str]
    membership_note: str
    indicative_price_qtl: float
    lat: float
    lng: float
    phone: str
    verified: bool
    pickup_offered: bool
    district: str
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True


class SellRequestCreate(BaseModel):
    batch_id: int
    destination_type: str
    destination_id: int
    quantity_kg: float


class SellRequestRead(BaseModel):
    id: int
    status: str


# --- logistics ---
class ColdStorageRead(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    total_capacity_kg: float
    available_capacity_kg: float
    crops: list[str]
    cost_per_kg_per_day: float
    phone: str
    district: str
    distance_km: Optional[float] = None
    available_pct: float = 0.0

    class Config:
        from_attributes = True


class TransportProviderRead(BaseModel):
    id: int
    name: str
    vehicle_type: str
    capacity_kg: float
    rate_per_km: float
    min_fare: float
    phone: str
    district: str
    estimated_cost: Optional[float] = None

    class Config:
        from_attributes = True


class TransportRequestCreate(BaseModel):
    pickup: str
    destination: str
    crop: str
    quantity_kg: float
    date: date
    provider_id: Optional[int] = None


class TransportRequestRead(BaseModel):
    reference: str
