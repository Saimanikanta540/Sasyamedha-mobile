from datetime import datetime

from fastapi import APIRouter, Depends
from sqlmodel import Session, func, select

from auth import get_current_farmer
from db import get_session
from models import ColdStorage, Farmer, TransportProvider, TransportRequest
from schemas import ColdStorageRead, TransportProviderRead, TransportRequestCreate, TransportRequestRead
from services.geo import haversine_km

router = APIRouter(tags=["logistics"])


@router.get("/cold-storages", response_model=list[ColdStorageRead])
def list_cold_storages(
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float = 50,
    crop: str | None = None,
    session: Session = Depends(get_session),
):
    storages = session.exec(select(ColdStorage)).all()
    results = []
    for s in storages:
        if crop and crop not in s.crops:
            continue
        distance = haversine_km(lat, lng, s.lat, s.lng) if lat is not None and lng is not None else None
        if distance is not None and distance > radius_km:
            continue
        item = ColdStorageRead.model_validate(s)
        item.distance_km = distance
        item.available_pct = round(100 * s.available_capacity_kg / s.total_capacity_kg, 1)
        results.append(item)
    results.sort(key=lambda i: i.distance_km if i.distance_km is not None else 0)
    return results


@router.get("/transport", response_model=list[TransportProviderRead])
def list_transport(
    quantity_kg: float | None = None,
    lat: float | None = None,
    lng: float | None = None,
    distance_km: float | None = None,
    session: Session = Depends(get_session),
):
    providers = session.exec(select(TransportProvider)).all()
    results = []
    for p in providers:
        if quantity_kg is not None and p.capacity_kg < quantity_kg:
            continue
        item = TransportProviderRead.model_validate(p)
        dist = distance_km
        if dist is None and lat is not None and lng is not None:
            dist = haversine_km(lat, lng, p.lat, p.lng)
        if dist is not None:
            item.estimated_cost = round(max(p.min_fare, p.rate_per_km * dist), 2)
        results.append(item)
    results.sort(key=lambda i: i.capacity_kg)
    return results


@router.post("/transport-requests", response_model=TransportRequestRead)
def create_transport_request(
    body: TransportRequestCreate,
    session: Session = Depends(get_session),
    farmer: Farmer = Depends(get_current_farmer),
):
    count = session.exec(select(func.count()).select_from(TransportRequest)).one()
    reference = f"TR-{datetime.utcnow().strftime('%y%m')}-{count + 1:04d}"

    req = TransportRequest(
        farmer_id=farmer.id,
        reference=reference,
        pickup=body.pickup,
        destination=body.destination,
        crop=body.crop,
        quantity_kg=body.quantity_kg,
        date=body.date,
        provider_id=body.provider_id,
    )
    session.add(req)
    session.commit()
    return TransportRequestRead(reference=reference)
