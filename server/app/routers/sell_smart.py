import logging
from typing import Optional
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Destination, MandiPrice
from app.schemas.sell_smart import SellSmartRequest, SellSmartResponse, SellSmartDestination, CostBreakdown
from app.services.geo import haversine_distance
from app.services.logistics import calculate_transport_cost

logger = logging.getLogger(__name__)
router = APIRouter(tags=["sell_smart"])

@router.post("/sell-smart", response_model=SellSmartResponse)
def sell_smart(
    body: SellSmartRequest,
    session: Session = Depends(get_session)
) -> SellSmartResponse:
    
    # We query destinations that accept this commodity
    # Assuming crops_accepted is a JSON list of strings
    # We might need to filter manually if JSON filtering is complex in SQLite
    destinations = session.exec(select(Destination)).all()
    
    results = []
    
    for dest in destinations:
        if body.commodity not in dest.crops_accepted:
            continue
            
        if dest.min_quantity_kg is not None and body.quantity_kg < dest.min_quantity_kg:
            continue
        if dest.max_quantity_kg is not None and body.quantity_kg > dest.max_quantity_kg:
            continue
            
        price_per_kg = 0.0
        if dest.type == 'mandi':
            # Look up price in MandiPrice based on market name and commodity
            # For simplicity, we take the most recent modal price
            mandi_price = session.exec(
                select(MandiPrice)
                .where(MandiPrice.market == dest.name)
                .where(MandiPrice.commodity == body.commodity)
                .order_by(MandiPrice.price_date.desc())
            ).first()
            if not mandi_price:
                continue
            price_per_kg = mandi_price.modal_price / 100.0
        else:
            if dest.offer_price_per_kg is None:
                continue
            price_per_kg = dest.offer_price_per_kg
            
        distance_km = haversine_distance(body.farmer_lat, body.farmer_lng, dest.latitude, dest.longitude)
        transport_cost = calculate_transport_cost(distance_km, body.quantity_kg)
        
        # storage cost. assuming 1 INR / kg / day if no specific cold storage is requested, 
        # but spec says "if a storage scenario is requested". 
        # The prompt mentioned: "if a storage scenario is requested, cost_per_kg_per_day * quantity_kg * storage_days".
        # It didn't mention where `cost_per_kg_per_day` comes from in this endpoint, 
        # so we'll assume a default or pass it? Let's assume a default of 0.5 per kg per day.
        storage_cost = 0.0
        if body.storage_days and body.storage_days > 0:
            storage_cost = 0.5 * body.quantity_kg * body.storage_days
            
        gross_revenue = body.quantity_kg * price_per_kg
        net_return = gross_revenue - transport_cost - storage_cost
        
        breakdown = CostBreakdown(
            gross_revenue=gross_revenue,
            transport_cost=transport_cost,
            storage_cost=storage_cost,
            net_return=net_return,
            delta_from_best=0.0 # to be calculated later
        )
        
        results.append(SellSmartDestination(
            destination_id=dest.id,
            type=dest.type,
            name=dest.name,
            distance_km=distance_km,
            price_per_kg=price_per_kg,
            breakdown=breakdown
        ))
        
    # Rank by net_return descending
    results.sort(key=lambda x: x.breakdown.net_return, reverse=True)
    
    if results:
        best_return = results[0].breakdown.net_return
        for r in results:
            r.breakdown.delta_from_best = r.breakdown.net_return - best_return
            
    # Log inputs and outputs for observability (NFR-15)
    logger.info("Sell Smart computed", extra={
        "farmer_lat": body.farmer_lat,
        "farmer_lng": body.farmer_lng,
        "commodity": body.commodity,
        "quantity_kg": body.quantity_kg,
        "results_count": len(results)
    })
            
    return SellSmartResponse(results=results)
