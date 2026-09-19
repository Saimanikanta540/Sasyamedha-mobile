from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from auth import get_current_farmer
from db import get_session
from models import CropBatch, Farmer
from schemas import SellSmartRequest, SellSmartResponse
from services.sell_smart import compute_sell_smart

router = APIRouter(tags=["sell-smart"])


@router.post("/sell-smart", response_model=SellSmartResponse)
def sell_smart(
    body: SellSmartRequest,
    session: Session = Depends(get_session),
    farmer: Farmer = Depends(get_current_farmer),
):
    if body.batch_id is not None:
        batch = session.get(CropBatch, body.batch_id)
        if batch is None:
            raise HTTPException(404, "Batch not found")
        crop, quantity_kg, lat, lng = batch.crop, batch.quantity_kg, batch.lat, batch.lng
    else:
        if body.crop is None or body.quantity_kg is None or body.lat is None or body.lng is None:
            raise HTTPException(400, "Provide batch_id or crop/quantity_kg/lat/lng")
        crop, quantity_kg, lat, lng = body.crop, body.quantity_kg, body.lat, body.lng

    return compute_sell_smart(
        session, crop=crop, quantity_kg=quantity_kg, lat=lat, lng=lng,
        storage_days=body.storage_days, lang=farmer.language,
    )
