from sqlmodel import Session, select

from models import Buyer, ColdStorage, CropBatch, Fpo, Market, MarketPrice, TransportProvider
from services.geo import haversine_km
from services.logistics import transport_cost

ESTIMATE_NOTICE = {
    "en": "These are estimated figures based on current listed prices and typical transport costs. Actual prices are not guaranteed and may vary.",
    "te": "ఇవి ప్రస్తుత జాబితా ధరలు మరియు సాధారణ రవాణా ఖర్చుల ఆధారంగా అంచనా వేసిన గణాంకాలు. వాస్తవ ధరలు హామీ ఇవ్వబడవు మరియు మారవచ్చు.",
    "hi": "ये आंकड़े मौजूदा सूचीबद्ध कीमतों और सामान्य परिवहन लागत के आधार पर अनुमानित हैं। वास्तविक कीमतों की गारंटी नहीं है और ये बदल सकती हैं।",
}


def _inr(n: float) -> str:
    return f"{n:,.0f}"


def _transport_breakdown(cost: float, distance_km: float, provider: TransportProvider | None) -> dict:
    if provider is None:
        return {"label": "Transport", "amount": 0, "formula": "No suitable vehicle found for this quantity"}
    floor_cost = provider.rate_per_km * distance_km
    if cost > floor_cost:
        formula = (
            f"min fare ₹{_inr(provider.min_fare)} ({provider.vehicle_type}, "
            f"{provider.capacity_kg:.0f} kg) > ₹{provider.rate_per_km:.0f}/km × {distance_km} km"
        )
    else:
        formula = (
            f"₹{provider.rate_per_km:.0f}/km × {distance_km} km "
            f"({provider.vehicle_type}, {provider.capacity_kg:.0f} kg)"
        )
    return {"label": "Transport", "amount": -cost, "formula": formula}


def _latest_prices_by_market(session: Session, crop: str) -> dict[int, MarketPrice]:
    rows = session.exec(
        select(MarketPrice)
        .where(MarketPrice.commodity == crop)
        .order_by(MarketPrice.price_date.desc())
    ).all()
    latest: dict[int, MarketPrice] = {}
    for row in rows:
        if row.market_id not in latest:
            latest[row.market_id] = row
    return latest


def _in_range(quantity_kg: float, min_qty: float | None, max_qty: float | None) -> bool:
    if min_qty is not None and quantity_kg < min_qty:
        return False
    if max_qty is not None and quantity_kg > max_qty:
        return False
    return True


def compute_sell_smart(
    session: Session,
    crop: str,
    quantity_kg: float,
    lat: float,
    lng: float,
    storage_days: int,
    lang: str,
) -> dict:
    providers = session.exec(select(TransportProvider)).all()

    candidates: list[dict] = []

    latest_by_market = _latest_prices_by_market(session, crop)
    markets_by_id = {m.id: m for m in session.exec(select(Market)).all()}
    for market_id, price in latest_by_market.items():
        market = markets_by_id[market_id]
        distance = haversine_km(lat, lng, market.lat, market.lng)
        price_per_kg = price.modal_price_qtl / 100
        gross = quantity_kg * price_per_kg
        cost, provider = transport_cost(providers, quantity_kg, distance)
        candidates.append(
            {
                "destination_type": "mandi",
                "destination_id": market.id,
                "name": market.name,
                "name_local": {"te": market.name_te, "hi": market.name_hi}.get(lang, market.name),
                "price_per_kg": round(price_per_kg, 2),
                "distance_km": distance,
                "gross": gross,
                "transport_cost": cost,
                "transport_provider": provider,
                "pickup_offered": False,
                "phone": "",
                "verified": True,
            }
        )

    for buyer in session.exec(select(Buyer)).all():
        if crop not in buyer.crops or not _in_range(quantity_kg, buyer.min_qty_kg, buyer.max_qty_kg):
            continue
        distance = haversine_km(lat, lng, buyer.lat, buyer.lng)
        price_per_kg = buyer.indicative_price_qtl / 100
        gross = quantity_kg * price_per_kg
        if buyer.pickup_offered:
            cost, provider = 0.0, None
        else:
            cost, provider = transport_cost(providers, quantity_kg, distance)
        candidates.append(
            {
                "destination_type": "buyer",
                "destination_id": buyer.id,
                "name": buyer.name,
                "name_local": buyer.name,
                "price_per_kg": round(price_per_kg, 2),
                "distance_km": distance,
                "gross": gross,
                "transport_cost": cost,
                "transport_provider": provider,
                "pickup_offered": buyer.pickup_offered,
                "phone": buyer.phone,
                "verified": buyer.verified,
            }
        )

    for fpo in session.exec(select(Fpo)).all():
        if crop not in fpo.crops:
            continue
        distance = haversine_km(lat, lng, fpo.lat, fpo.lng)
        price_per_kg = fpo.indicative_price_qtl / 100
        gross = quantity_kg * price_per_kg
        if fpo.pickup_offered:
            cost, provider = 0.0, None
        else:
            cost, provider = transport_cost(providers, quantity_kg, distance)
        candidates.append(
            {
                "destination_type": "fpo",
                "destination_id": fpo.id,
                "name": fpo.name,
                "name_local": fpo.name,
                "price_per_kg": round(price_per_kg, 2),
                "distance_km": distance,
                "gross": gross,
                "transport_cost": cost,
                "transport_provider": provider,
                "pickup_offered": fpo.pickup_offered,
                "phone": fpo.phone,
                "verified": fpo.verified,
            }
        )

    storage_cost = 0.0
    if storage_days > 0:
        storages = session.exec(select(ColdStorage)).all()
        avg_rate = sum(s.cost_per_kg_per_day for s in storages) / len(storages) if storages else 0.0
        storage_cost = quantity_kg * avg_rate * storage_days

    for c in candidates:
        c["storage_cost"] = storage_cost
        c["net_return"] = c["gross"] - c["transport_cost"] - storage_cost

    candidates.sort(key=lambda c: (-c["net_return"], c["distance_km"]))

    best_net = candidates[0]["net_return"] if candidates else 0.0

    results = []
    for i, c in enumerate(candidates, start=1):
        breakdown = [
            {
                "label": "Gross",
                "amount": round(c["gross"]),
                "formula": f"{quantity_kg:.0f} kg × ₹{c['price_per_kg']:.2f}/kg",
            }
        ]
        if c["pickup_offered"]:
            breakdown.append(
                {"label": "Transport", "amount": 0, "formula": f"{c['name']} collects at farm gate"}
            )
        else:
            breakdown.append(_transport_breakdown(c["transport_cost"], c["distance_km"], c["transport_provider"]))
        if storage_cost > 0:
            breakdown.append(
                {
                    "label": "Storage",
                    "amount": -round(storage_cost),
                    "formula": f"{quantity_kg:.0f} kg × ₹{storage_cost / quantity_kg / storage_days:.2f}/kg/day × {storage_days} days",
                }
            )
        results.append(
            {
                "rank": i,
                "destination_type": c["destination_type"],
                "destination_id": c["destination_id"],
                "name": c["name"],
                "name_local": c["name_local"],
                "price_per_kg": c["price_per_kg"],
                "distance_km": c["distance_km"],
                "gross": round(c["gross"], 2),
                "transport_cost": round(c["transport_cost"], 2),
                "storage_cost": round(c["storage_cost"], 2),
                "net_return": round(c["net_return"], 2),
                "delta_vs_best": round(c["net_return"] - best_net, 2),
                "pickup_offered": c["pickup_offered"],
                "phone": c["phone"],
                "verified": c["verified"],
                "breakdown": breakdown,
            }
        )

    return {
        "batch": {"crop": crop, "quantity_kg": quantity_kg, "lat": lat, "lng": lng},
        "estimate_notice": ESTIMATE_NOTICE.get(lang, ESTIMATE_NOTICE["en"]),
        "results": results,
    }
