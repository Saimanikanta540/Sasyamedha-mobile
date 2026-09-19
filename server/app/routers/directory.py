from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import Destination
from app.schemas.destination import DestinationResponse
from app.services.geo import haversine_distance

router = APIRouter(tags=["directory"])


def _matches(dest: Destination, commodity: Optional[str], quantity_kg: Optional[float]) -> bool:
    if commodity and commodity not in dest.crops_accepted:
        return False
    if quantity_kg is not None:
        if dest.min_quantity_kg is not None and quantity_kg < dest.min_quantity_kg:
            return False
        if dest.max_quantity_kg is not None and quantity_kg > dest.max_quantity_kg:
            return False
    return True


def _to_response(dest: Destination, lat: Optional[float], lng: Optional[float]) -> DestinationResponse:
    distance = haversine_distance(lat, lng, dest.latitude, dest.longitude) if lat is not None and lng is not None else None
    return DestinationResponse(
        id=dest.id,
        name=dest.name,
        address=dest.district or "",
        lat=dest.latitude,
        lng=dest.longitude,
        crops_accepted=dest.crops_accepted,
        min_quantity_kg=dest.min_quantity_kg,
        max_quantity_kg=dest.max_quantity_kg,
        indicative_price_per_kg=dest.offer_price_per_kg,
        phone=dest.contact_phone,
        verified=dest.verified,
        distance_km=distance,
    )


def _list_by_type(
    session: Session,
    dest_type: str,
    commodity: Optional[str],
    quantity_kg: Optional[float],
    lat: Optional[float],
    lng: Optional[float],
    radius_km: Optional[float],
) -> list[DestinationResponse]:
    rows = session.exec(select(Destination).where(Destination.type == dest_type)).all()
    results = []
    for row in rows:
        if not _matches(row, commodity, quantity_kg):
            continue
        item = _to_response(row, lat, lng)
        if radius_km is not None and item.distance_km is not None and item.distance_km > radius_km:
            continue
        results.append(item)
    if lat is not None and lng is not None:
        results.sort(key=lambda r: r.distance_km if r.distance_km is not None else float("inf"))
    return results


@router.get("/buyers", response_model=list[DestinationResponse])
def list_buyers(
    commodity: Optional[str] = None,
    quantity_kg: Optional[float] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = None,
    session: Session = Depends(get_session),
) -> list[DestinationResponse]:
    return _list_by_type(session, "buyer", commodity, quantity_kg, lat, lng, radius_km)


@router.get("/fpos", response_model=list[DestinationResponse])
def list_fpos(
    commodity: Optional[str] = None,
    quantity_kg: Optional[float] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = None,
    session: Session = Depends(get_session),
) -> list[DestinationResponse]:
    return _list_by_type(session, "fpo", commodity, quantity_kg, lat, lng, radius_km)


@router.get("/buyers/{destination_id}", response_model=DestinationResponse)
def get_buyer(
    destination_id: UUID,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    session: Session = Depends(get_session),
) -> DestinationResponse:
    dest = session.get(Destination, destination_id)
    if dest is None or dest.type not in ("buyer", "fpo"):
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Buyer/FPO not found")
    return _to_response(dest, lat, lng)
