from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from db import get_session
from models import Market, MarketPrice
from schemas import MarketPriceItem, PriceHistoryPoint, PricesResponse
from services.geo import haversine_km

router = APIRouter(tags=["prices"])


@router.get("/prices", response_model=PricesResponse)
def list_prices(
    commodity: str | None = None,
    state: str | None = None,
    district: str | None = None,
    sort: str = "price",
    lat: float | None = None,
    lng: float | None = None,
    lang: str = "te",
    session: Session = Depends(get_session),
):
    today = session.exec(select(MarketPrice.price_date).order_by(MarketPrice.price_date.desc())).first()

    query = select(MarketPrice, Market).join(Market, MarketPrice.market_id == Market.id)
    if today is not None:
        query = query.where(MarketPrice.price_date == today)
    if commodity:
        query = query.where(MarketPrice.commodity == commodity)
    if state:
        query = query.where(Market.state == state)
    if district:
        query = query.where(Market.district == district)

    rows = session.exec(query).all()

    items = []
    for price, market in rows:
        distance = haversine_km(lat, lng, market.lat, market.lng) if lat is not None and lng is not None else None
        items.append(
            MarketPriceItem(
                market_id=market.id,
                market_name=market.name,
                market_name_local={"te": market.name_te, "hi": market.name_hi}.get(lang, market.name),
                district=market.district,
                commodity=price.commodity,
                variety=price.variety,
                min_price_qtl=price.min_price_qtl,
                max_price_qtl=price.max_price_qtl,
                modal_price_qtl=price.modal_price_qtl,
                modal_price_kg=round(price.modal_price_qtl / 100, 2),
                price_date=price.price_date,
                fetched_at=price.fetched_at,
                source=price.source,
                distance_km=distance,
            )
        )

    if sort == "distance" and lat is not None and lng is not None:
        items.sort(key=lambda i: i.distance_km)
    else:
        items.sort(key=lambda i: -i.modal_price_qtl)

    return PricesResponse(fetched_at=datetime.utcnow(), items=items)


@router.get("/prices/history", response_model=list[PriceHistoryPoint])
def price_history(market_id: int, commodity: str, session: Session = Depends(get_session)):
    rows = session.exec(
        select(MarketPrice)
        .where(MarketPrice.market_id == market_id, MarketPrice.commodity == commodity)
        .order_by(MarketPrice.price_date.asc())
    ).all()
    return [PriceHistoryPoint(date=r.price_date, modal_price_qtl=r.modal_price_qtl) for r in rows]
