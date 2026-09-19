import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import ColdStorage
from app.schemas.cold_storage import ColdStorageResponse
from app.services.geo import haversine_distance

logger = logging.getLogger(__name__)
router = APIRouter(tags=["cold_storage"])

@router.get("/cold-storage", response_model=list[ColdStorageResponse])
def get_cold_storage(
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = None,
    commodity: Optional[str] = None,
    session: Session = Depends(get_session),
) -> list[ColdStorageResponse]:
    query = select(ColdStorage)
    results = session.exec(query).all()
    
    response_list = []
    for storage in results:
        # Filter by commodity using supported_crops JSON array
        if commodity and commodity not in storage.supported_crops:
            continue
            
        distance = None
        if lat is not None and lng is not None:
            distance = haversine_distance(lat, lng, storage.latitude, storage.longitude)
            # Filter by radius
            if radius_km is not None and distance > radius_km:
                continue
                
        # Send both raw numbers and percentage for UI
        utilization = 0.0
        if storage.total_capacity_kg > 0:
            utilization = storage.available_capacity_kg / storage.total_capacity_kg
            
        response_list.append(ColdStorageResponse(
            id=storage.id,
            name=storage.name,
            latitude=storage.latitude,
            longitude=storage.longitude,
            total_capacity_kg=storage.total_capacity_kg,
            available_capacity_kg=storage.available_capacity_kg,
            utilization_percentage=utilization,
            supported_crops=storage.supported_crops,
            cost_per_kg_per_day=storage.cost_per_kg_per_day,
            contact_phone=storage.contact_phone,
            distance_km=distance
        ))
        
    if lat is not None and lng is not None:
        response_list.sort(key=lambda x: x.distance_km if x.distance_km is not None else float('inf'))
        
    return response_list
