from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from auth import get_current_farmer
from db import get_session
from models import CropBatch, Farmer
from schemas import BatchCreate, BatchRead

router = APIRouter(prefix="/batches", tags=["batches"])


@router.post("", response_model=BatchRead)
def create_batch(
    body: BatchCreate,
    session: Session = Depends(get_session),
    farmer: Farmer = Depends(get_current_farmer),
):
    batch = CropBatch(farmer_id=farmer.id, **body.model_dump())
    session.add(batch)
    session.commit()
    session.refresh(batch)
    return batch


@router.get("", response_model=list[BatchRead])
def list_batches(
    session: Session = Depends(get_session),
    farmer: Farmer = Depends(get_current_farmer),
):
    return session.exec(
        select(CropBatch).where(CropBatch.farmer_id == farmer.id).order_by(CropBatch.created_at.desc())
    ).all()
