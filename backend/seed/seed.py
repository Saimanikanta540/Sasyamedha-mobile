import json
import random
from datetime import date, timedelta
from pathlib import Path

from sqlmodel import Session, select

from models import (
    Buyer,
    ColdStorage,
    CropBatch,
    Farmer,
    Fpo,
    Market,
    MarketPrice,
    Treatment,
    TransportProvider,
)

SEED_DIR = Path(__file__).parent


def _load(name: str) -> list:
    with open(SEED_DIR / name, encoding="utf-8") as f:
        return json.load(f)


def seed_if_empty(session: Session) -> bool:
    """Idempotent: populates all seed tables only if Market is empty. Returns True if seeded."""
    if session.exec(select(Market)).first() is not None:
        return False

    markets = [Market(**m) for m in _load("markets.json")]
    session.add_all(markets)
    session.flush()

    today = date.today()
    for row in _load("prices.json"):
        market = markets[row.pop("market_index")]
        session.add(
            MarketPrice(
                market_id=market.id,
                price_date=today,
                source="seed",
                **row,
            )
        )

    guntur = markets[0]
    rng = random.Random(42)
    base = 3500.0
    for days_ago in range(14, 0, -1):
        drift = rng.uniform(-120, 120)
        base = max(2800.0, min(4200.0, base + drift))
        modal = round(base)
        session.add(
            MarketPrice(
                market_id=guntur.id,
                commodity="tomato",
                variety="Hybrid",
                min_price_qtl=round(modal * 0.92),
                max_price_qtl=round(modal * 1.08),
                modal_price_qtl=modal,
                price_date=today - timedelta(days=days_ago),
                source="seed",
            )
        )

    for f in _load("fpos.json"):
        session.add(Fpo(**f))
    for b in _load("buyers.json"):
        session.add(Buyer(**b))
    for c in _load("cold_storages.json"):
        session.add(ColdStorage(**c))
    for t in _load("transport.json"):
        session.add(TransportProvider(**t))
    for t in _load("treatments.json"):
        session.add(Treatment(**t))

    farmer = Farmer(
        phone="9999900001",
        name="Lakshmi",
        language="te",
        state="Andhra Pradesh",
        district="Guntur",
        village="Pedakakani",
        lat=16.3067,
        lng=80.4365,
    )
    session.add(farmer)
    session.flush()

    session.add(
        CropBatch(
            farmer_id=farmer.id,
            crop="tomato",
            quantity_kg=500,
            lat=farmer.lat,
            lng=farmer.lng,
            status="open",
        )
    )

    session.commit()
    return True
