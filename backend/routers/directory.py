from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from auth import get_current_farmer
from db import get_session
from models import Buyer, CropBatch, Farmer, Fpo, SellRequest
from schemas import BuyerRead, FpoRead, SellRequestCreate, SellRequestRead
from services.geo import haversine_km

router = APIRouter(tags=["directory"])


@router.get("/buyers", response_model=list[BuyerRead])
def list_buyers(
    crop: str | None = None,
    quantity_kg: float | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float = 50,
    session: Session = Depends(get_session),
):
    buyers = session.exec(select(Buyer)).all()
    results = []
    for b in buyers:
        if crop and crop not in b.crops:
            continue
        if quantity_kg is not None:
            if b.min_qty_kg is not None and quantity_kg < b.min_qty_kg:
                continue
            if b.max_qty_kg is not None and quantity_kg > b.max_qty_kg:
                continue
        distance = haversine_km(lat, lng, b.lat, b.lng) if lat is not None and lng is not None else None
        if distance is not None and distance > radius_km:
            continue
        item = BuyerRead.model_validate(b)
        item.distance_km = distance
        results.append(item)
    results.sort(key=lambda i: i.distance_km if i.distance_km is not None else 0)
    return results


@router.get("/fpos", response_model=list[FpoRead])
def list_fpos(
    crop: str | None = None,
    quantity_kg: float | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float = 50,
    session: Session = Depends(get_session),
):
    fpos = session.exec(select(Fpo)).all()
    results = []
    for f in fpos:
        if crop and crop not in f.crops:
            continue
        distance = haversine_km(lat, lng, f.lat, f.lng) if lat is not None and lng is not None else None
        if distance is not None and distance > radius_km:
            continue
        item = FpoRead.model_validate(f)
        item.distance_km = distance
        results.append(item)
    results.sort(key=lambda i: i.distance_km if i.distance_km is not None else 0)
    return results


@router.post("/sell-requests", response_model=SellRequestRead)
def create_sell_request(
    body: SellRequestCreate,
    session: Session = Depends(get_session),
    farmer: Farmer = Depends(get_current_farmer),
):
    batch = session.get(CropBatch, body.batch_id)
    if batch is None:
        raise HTTPException(404, "Batch not found")
    price_per_kg = 0.0
    if body.destination_type == "buyer":
        dest = session.get(Buyer, body.destination_id)
        price_per_kg = dest.indicative_price_qtl / 100 if dest else 0.0
    elif body.destination_type == "fpo":
        dest = session.get(Fpo, body.destination_id)
        price_per_kg = dest.indicative_price_qtl / 100 if dest else 0.0
    expected_net = body.quantity_kg * price_per_kg

    req = SellRequest(
        farmer_id=farmer.id,
        batch_id=body.batch_id,
        destination_type=body.destination_type,
        destination_id=body.destination_id,
        quantity_kg=body.quantity_kg,
        expected_net=expected_net,
    )
    session.add(req)
    session.commit()
    session.refresh(req)
    return SellRequestRead(id=req.id, status=req.status)
