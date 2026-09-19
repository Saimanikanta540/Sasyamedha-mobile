from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from db import get_session
from models import Treatment
from schemas import TreatmentRead

router = APIRouter(prefix="/treatments", tags=["treatments"])


@router.get("/{class_key}", response_model=TreatmentRead)
def get_treatment(class_key: str, lang: str = "en", session: Session = Depends(get_session)):
    treatment = session.exec(
        select(Treatment).where(Treatment.class_key == class_key, Treatment.lang == lang)
    ).first()
    if treatment is None:
        treatment = session.exec(
            select(Treatment).where(Treatment.class_key == class_key, Treatment.lang == "en")
        ).first()
    if treatment is None:
        raise HTTPException(404, "Guidance not available for this class")
    return treatment
