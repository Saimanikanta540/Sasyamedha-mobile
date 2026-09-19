"""Idempotent seed for MandiPrice / Destination / ColdStorage / TransportProvider —
the tables Prices, Sell Smart, Cold Storage and Transport all read from, and which
had zero rows (the seed script previously only covered TreatmentRecord). Safe to
run repeatedly: skips rows that already exist by their natural key.
"""

from datetime import date

from sqlmodel import Session, select

from app.models import ColdStorage, Destination, MandiPrice, TransportProvider

MARKETS = [
    {"market": "Guntur Market Yard", "district": "Guntur", "lat": 16.5000, "lng": 80.6200},
    {"market": "Khammam Market Yard", "district": "Khammam", "lat": 17.3900, "lng": 80.1500},
    {"market": "Tenali Market", "district": "Guntur", "lat": 16.2430, "lng": 80.6400},
    {"market": "Narasaraopet Market", "district": "Guntur", "lat": 16.2350, "lng": 80.0500},
]
STATE_BY_DISTRICT = {"Guntur": "Andhra Pradesh", "Khammam": "Telangana"}

# modal ₹/quintal per market (index-aligned with MARKETS), one column per commodity
PRICES = {
    "tomato": {"variety": "Hybrid", "modal": [3500, 3800, 3350, 3280]},
    "chilli": {"variety": "Guntur Sannam", "modal": [14500, 15200, 13800, 13500]},
    "paddy": {"variety": "Common", "modal": [2100, 2050, 2080, 2000]},
    "cotton": {"variety": "Medium Staple", "modal": [7200, 7100, 7050, 7000]},
}

FPOS_AND_BUYERS = [
    {
        "type": "fpo",
        "name": "Krishna Valley Farmer Producer Organization",
        "latitude": 16.3500,
        "longitude": 80.5000,
        "district": "Guntur",
        "contact_phone": "9848000101",
        "crops_accepted": ["tomato", "chilli"],
        "min_quantity_kg": None,
        "max_quantity_kg": None,
        "offer_price_per_kg": 33.0,
        "verified": True,
    },
    {
        "type": "buyer",
        "name": "Sri Venkateswara Traders",
        "latitude": 16.4200,
        "longitude": 80.5500,
        "district": "Guntur",
        "contact_phone": "9876500001",
        "crops_accepted": ["tomato"],
        "min_quantity_kg": 200,
        "max_quantity_kg": 2000,
        "offer_price_per_kg": 34.0,
        "verified": True,
    },
    {
        "type": "buyer",
        "name": "AgriFresh Wholesale",
        "latitude": 15.7000,
        "longitude": 80.6000,
        "district": "Bapatla",
        "contact_phone": "9876500002",
        "crops_accepted": ["tomato", "paddy"],
        "min_quantity_kg": 500,
        "max_quantity_kg": 5000,
        "offer_price_per_kg": 34.5,
        "verified": True,
    },
]

COLD_STORAGES = [
    {
        "name": "Guntur Cold Storage",
        "latitude": 16.3200,
        "longitude": 80.4600,
        "total_capacity_kg": 250000,
        "available_capacity_kg": 90000,
        "supported_crops": ["tomato", "chilli", "paddy", "cotton"],
        "cost_per_kg_per_day": 0.85,
        "contact_phone": "9866000201",
    },
    {
        "name": "Mangalagiri AgriStore",
        "latitude": 16.4300,
        "longitude": 80.5600,
        "total_capacity_kg": 180000,
        "available_capacity_kg": 60000,
        "supported_crops": ["tomato", "paddy"],
        "cost_per_kg_per_day": 0.75,
        "contact_phone": "9866000202",
    },
    {
        "name": "Tenali Cold Chain Facility",
        "latitude": 16.2430,
        "longitude": 80.6400,
        "total_capacity_kg": 200000,
        "available_capacity_kg": 120000,
        "supported_crops": ["tomato", "chilli", "cotton"],
        "cost_per_kg_per_day": 0.95,
        "contact_phone": "9866000203",
    },
]

TRANSPORT_PROVIDERS = [
    {
        "name": "Ravi Auto Transport",
        "vehicle_type": "3-wheeler tempo",
        "capacity_kg": 400,
        "latitude": 16.3100,
        "longitude": 80.4400,
        "rate_per_km": 18,
        "contact_phone": "9900011001",
    },
    {
        "name": "Guntur Mini Trucks",
        "vehicle_type": "Tata Ace",
        "capacity_kg": 850,
        "latitude": 16.3100,
        "longitude": 80.4400,
        "rate_per_km": 30,
        "contact_phone": "9900011002",
    },
    {
        "name": "Sri Lakshmi Carriers",
        "vehicle_type": "Mahindra Bolero pickup",
        "capacity_kg": 1500,
        "latitude": 16.3100,
        "longitude": 80.4400,
        "rate_per_km": 38,
        "contact_phone": "9900011003",
    },
    {
        "name": "Annapurna Logistics",
        "vehicle_type": "6-tyre truck",
        "capacity_kg": 6000,
        "latitude": 16.3100,
        "longitude": 80.4400,
        "rate_per_km": 55,
        "contact_phone": "9900011004",
    },
]


def seed_mandi_prices(session: Session) -> int:
    inserted = 0
    today = date.today()
    for commodity, cfg in PRICES.items():
        for market, modal in zip(MARKETS, cfg["modal"]):
            exists = session.exec(
                select(MandiPrice).where(
                    MandiPrice.market == market["market"],
                    MandiPrice.commodity == commodity,
                    MandiPrice.price_date == today,
                )
            ).first()
            if exists:
                continue
            session.add(
                MandiPrice(
                    commodity=commodity,
                    variety=cfg["variety"],
                    state=STATE_BY_DISTRICT[market["district"]],
                    district=market["district"],
                    market=market["market"],
                    min_price=round(modal * 0.92),
                    max_price=round(modal * 1.08),
                    modal_price=modal,
                    price_date=today,
                    latitude=market["lat"],
                    longitude=market["lng"],
                )
            )
            inserted += 1
    session.commit()
    return inserted


def seed_destinations(session: Session) -> int:
    inserted = 0

    # One 'mandi' destination per market so Sell Smart can find it — name must
    # match MandiPrice.market exactly (see services/sell_smart's lookup).
    for market in MARKETS:
        exists = session.exec(
            select(Destination).where(Destination.type == "mandi", Destination.name == market["market"])
        ).first()
        if exists:
            continue
        session.add(
            Destination(
                type="mandi",
                name=market["market"],
                latitude=market["lat"],
                longitude=market["lng"],
                district=market["district"],
                crops_accepted=list(PRICES.keys()),
                verified=True,
            )
        )
        inserted += 1

    for entry in FPOS_AND_BUYERS:
        exists = session.exec(
            select(Destination).where(Destination.type == entry["type"], Destination.name == entry["name"])
        ).first()
        if exists:
            continue
        session.add(Destination(**entry))
        inserted += 1

    session.commit()
    return inserted


def seed_cold_storage(session: Session) -> int:
    inserted = 0
    for entry in COLD_STORAGES:
        exists = session.exec(select(ColdStorage).where(ColdStorage.name == entry["name"])).first()
        if exists:
            continue
        session.add(ColdStorage(**entry))
        inserted += 1
    session.commit()
    return inserted


def seed_transport_providers(session: Session) -> int:
    inserted = 0
    for entry in TRANSPORT_PROVIDERS:
        exists = session.exec(select(TransportProvider).where(TransportProvider.name == entry["name"])).first()
        if exists:
            continue
        session.add(TransportProvider(**entry))
        inserted += 1
    session.commit()
    return inserted
