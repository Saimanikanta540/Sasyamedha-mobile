from uuid import UUID, uuid4

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class Destination(SQLModel, table=True):
    """Unifies mandi / buyer / FPO into one comparable entity for Sell Smart.

    `offer_price_per_kg` is not in the original brief's schema — it's added
    because Sell Smart's gross_revenue formula needs *some* price per
    destination, and only 'mandi' type destinations have one derivable from
    MandiPrice by (commodity, market). A 'buyer' or 'fpo' destination has no
    other source of truth for what it pays, so it needs its own stored offer
    price. Left null for 'mandi' rows, where the price is looked up live
    instead (see services/sell_smart_engine.py).
    """

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    type: str = Field(index=True)  # 'mandi' | 'buyer' | 'fpo'
    name: str
    latitude: float
    longitude: float
    contact_phone: str | None = None
    crops_accepted: list[str] = Field(sa_column=Column(JSON))
    min_quantity_kg: float | None = None
    max_quantity_kg: float | None = None
    offer_price_per_kg: float | None = None
