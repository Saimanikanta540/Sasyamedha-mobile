import logging
from typing import Optional
from datetime import datetime
from uuid import uuid4
from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session, select
from app.database import get_session
from app.models import TransportProvider, TransportRequest, User
from app.schemas.logistics import (
    TransportEstimateResponse,
    TransportProviderResponse,
    TransportRequestCreate,
    TransportRequestResponse
)
from app.services.geo import haversine_distance
from app.services.logistics import calculate_transport_cost
from app.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(tags=["logistics"])

@router.get("/transport-providers", response_model=list[TransportProviderResponse])
def get_transport_providers(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    quantity_kg: Optional[float] = None,
    commodity: Optional[str] = None,
    session: Session = Depends(get_session),
) -> list[TransportProviderResponse]:
    query = select(TransportProvider)
    if quantity_kg is not None:
        query = query.where(TransportProvider.capacity_kg >= quantity_kg)
        
    results = session.exec(query).all()
    
    response_list = []
    for provider in results:
        distance = None
        if lat is not None and lng is not None:
            distance = haversine_distance(lat, lng, provider.latitude, provider.longitude)
            
        response_list.append(TransportProviderResponse(
            id=provider.id,
            name=provider.name,
            vehicle_type=provider.vehicle_type,
            capacity_kg=provider.capacity_kg,
            latitude=provider.latitude,
            longitude=provider.longitude,
            rate_per_km=provider.rate_per_km,
            flat_route_rate=provider.flat_route_rate,
            contact_phone=provider.contact_phone,
            distance_km=distance
        ))
        
    if lat is not None and lng is not None:
        response_list.sort(key=lambda x: x.distance_km if x.distance_km is not None else float('inf'))
        
    return response_list

@router.get("/transport-estimate", response_model=TransportEstimateResponse)
def get_transport_estimate(
    pickup_lat: float,
    pickup_lng: float,
    dest_lat: float,
    dest_lng: float,
    quantity_kg: float,
) -> TransportEstimateResponse:
    distance = haversine_distance(pickup_lat, pickup_lng, dest_lat, dest_lng)
    
    # We estimate based on a generic base rate since no provider is specified here.
    # We use our single source of truth function.
    cost = calculate_transport_cost(distance_km=distance, quantity_kg=quantity_kg)
    
    return TransportEstimateResponse(
        distance_km=distance,
        estimated_cost=cost
    )

@router.post("/transport-request", response_model=TransportRequestResponse, status_code=status.HTTP_201_CREATED)
def create_transport_request(
    body: TransportRequestCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TransportRequestResponse:
    
    ref_number = f"TR-{datetime.now().strftime('%Y%m%d')}-{str(uuid4())[:5].upper()}"
    
    request = TransportRequest(
        user_id=current_user.id,
        reference_number=ref_number,
        pickup_lat=body.pickup_lat,
        pickup_lng=body.pickup_lng,
        destination_lat=body.destination_lat,
        destination_lng=body.destination_lng,
        commodity=body.commodity,
        quantity_kg=body.quantity_kg,
        scheduled_date=body.scheduled_date,
        status="pending"
    )
    session.add(request)
    session.commit()
    session.refresh(request)
    
    return TransportRequestResponse(
        id=request.id,
        reference_number=request.reference_number,
        status=request.status
    )
