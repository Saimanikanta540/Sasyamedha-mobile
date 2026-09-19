from datetime import date, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class MandiPrice(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    commodity: str = Field(index=True)
    variety: str
    state: str = Field(index=True)
    district: str = Field(index=True)
    market: str = Field(index=True)
    min_price: float
    max_price: float
    modal_price: float
    price_date: date = Field(index=True)
    ingested_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    latitude: float | None = None
    longitude: float | None = None
    # 'seed' (app/seed/market_seed.py) or 'ogd' (data.gov.in, see
    # services/price_ingestion.py) — never hide which one a price actually is.
    source: str = Field(default="seed", index=True)
