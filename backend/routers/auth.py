from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from auth import issue_token
from db import get_session
from models import Farmer
from schemas import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(Farmer).where(Farmer.phone == body.phone)).first()
    if existing is not None:
        raise HTTPException(409, "Phone already registered")
    farmer = Farmer(**body.model_dump())
    session.add(farmer)
    session.commit()
    session.refresh(farmer)
    return TokenResponse(token=issue_token(farmer.id), farmer=farmer)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, session: Session = Depends(get_session)):
    farmer = session.exec(select(Farmer).where(Farmer.phone == body.phone)).first()
    if farmer is None:
        raise HTTPException(404, "No farmer with this phone. Please register.")
    return TokenResponse(token=issue_token(farmer.id), farmer=farmer)
