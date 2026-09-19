from fastapi import APIRouter, Depends
from sqlmodel import Session

from auth import get_current_farmer
from db import get_session
from models import Farmer
from schemas import FarmerRead, FarmerUpdate

router = APIRouter(tags=["profile"])


@router.get("/me", response_model=FarmerRead)
def get_me(farmer: Farmer = Depends(get_current_farmer)):
    return farmer


@router.patch("/me", response_model=FarmerRead)
def update_me(
    body: FarmerUpdate,
    session: Session = Depends(get_session),
    farmer: Farmer = Depends(get_current_farmer),
):
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(farmer, key, value)
    session.add(farmer)
    session.commit()
    session.refresh(farmer)
    return farmer
