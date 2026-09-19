from datetime import date, datetime
from typing import Optional

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class Farmer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    phone: str = Field(unique=True, index=True)
    name: str
    language: str = "te"
    state: str
    district: str
    village: Optional[str] = None
    lat: float
    lng: float
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CropBatch(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_id: int = Field(foreign_key="farmer.id")
    crop: str
    quantity_kg: float
    lat: float
    lng: float
    status: str = "open"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Scan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_id: int = Field(foreign_key="farmer.id")
    batch_id: Optional[int] = Field(default=None, foreign_key="cropbatch.id")
    image_path: str
    class_key: str
    confidence: float
    band: str
    is_mock: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Treatment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    class_key: str = Field(index=True)
    lang: str = Field(index=True)
    crop: str
    display_name: str
    symptoms: list = Field(default_factory=list, sa_column=Column(JSON))
    immediate_actions: list = Field(default_factory=list, sa_column=Column(JSON))
    prevention: list = Field(default_factory=list, sa_column=Column(JSON))
    indicative_cost_note: str
    disclaimer: str


class Market(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    name_te: str
    name_hi: str
    state: str
    district: str
    lat: float
    lng: float
    type: str = "mandi"


class MarketPrice(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    market_id: int = Field(foreign_key="market.id")
    commodity: str
    variety: Optional[str] = None
    min_price_qtl: float
    max_price_qtl: float
    modal_price_qtl: float
    price_date: date
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    source: str = "seed"


class Buyer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    crops: list = Field(default_factory=list, sa_column=Column(JSON))
    min_qty_kg: Optional[float] = None
    max_qty_kg: Optional[float] = None
    indicative_price_qtl: float
    lat: float
    lng: float
    phone: str
    verified: bool = False
    pickup_offered: bool = False
    district: str


class Fpo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    crops: list = Field(default_factory=list, sa_column=Column(JSON))
    services: list = Field(default_factory=list, sa_column=Column(JSON))
    membership_note: str
    indicative_price_qtl: float
    lat: float
    lng: float
    phone: str
    verified: bool = False
    pickup_offered: bool = False
    district: str


class ColdStorage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    lat: float
    lng: float
    total_capacity_kg: float
    available_capacity_kg: float
    crops: list = Field(default_factory=list, sa_column=Column(JSON))
    cost_per_kg_per_day: float
    phone: str
    district: str


class TransportProvider(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    vehicle_type: str
    capacity_kg: float
    rate_per_km: float
    min_fare: float
    lat: float
    lng: float
    phone: str
    district: str


class SellRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_id: int = Field(foreign_key="farmer.id")
    batch_id: int = Field(foreign_key="cropbatch.id")
    destination_type: str
    destination_id: int
    quantity_kg: float
    expected_net: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TransportRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_id: int = Field(foreign_key="farmer.id")
    reference: str = Field(unique=True, index=True)
    pickup: str
    destination: str
    crop: str
    quantity_kg: float
    date: date
    provider_id: Optional[int] = Field(default=None, foreign_key="transportprovider.id")
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
