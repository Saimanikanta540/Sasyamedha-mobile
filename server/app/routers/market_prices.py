import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query, Header, HTTPException, status
from sqlmodel import Session, select
from app.database import get_session
from app.models import MandiPrice
from app.schemas.market_prices import MandiPriceResponse
from app.services.geo import haversine_distance
from app.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(tags=["market_prices"])
settings = get_settings()

@router.get("/prices", response_model=list[MandiPriceResponse])
def get_prices(
    commodity: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    sort_by: str = Query("price", pattern="^(price|distance)$"),
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    session: Session = Depends(get_session),
) -> list[MandiPriceResponse]:
    query = select(MandiPrice)
    
    if commodity:
        query = query.where(MandiPrice.commodity == commodity)
    if state:
        query = query.where(MandiPrice.state == state)
    if district:
        query = query.where(MandiPrice.district == district)
        
    results = session.exec(query).all()
    
    response_list = []
    for item in results:
        # compute per kg prices server-side
        min_price_kg = item.min_price / 100
        max_price_kg = item.max_price / 100
        modal_price_kg = item.modal_price / 100
        
        distance = None
        if lat is not None and lng is not None and item.latitude is not None and item.longitude is not None:
            distance = haversine_distance(lat, lng, item.latitude, item.longitude)
            
        response_list.append(MandiPriceResponse(
            commodity=item.commodity,
            variety=item.variety,
            state=item.state,
            district=item.district,
            market=item.market,
            min_price=item.min_price,
            max_price=item.max_price,
            modal_price=item.modal_price,
            min_price_per_kg=min_price_kg,
            max_price_per_kg=max_price_kg,
            modal_price_per_kg=modal_price_kg,
            price_date=item.price_date,
            ingested_at=item.ingested_at,
            distance_km=distance
        ))
        
    if sort_by == "distance" and lat is not None and lng is not None:
        # Sort by distance ascending, items without distance go to end
        response_list.sort(key=lambda x: x.distance_km if x.distance_km is not None else float('inf'))
    else:
        # Default sort by price descending
        response_list.sort(key=lambda x: x.modal_price, reverse=True)
        
    return response_list

@router.post("/internal/ingest-prices", status_code=status.HTTP_202_ACCEPTED)
def ingest_prices_internal(
    x_internal_token: str = Header(...),
    session: Session = Depends(get_session)
):
    if x_internal_token != settings.internal_api_token:
        raise HTTPException(status_code=403, detail="Invalid internal token")
    
    # In a real scenario, this would call data.gov.in API
    # Since we don't have real ingestion logic, we'll just log it.
    logger.info("Internal price ingestion triggered")
    return {"message": "Ingestion triggered"}
