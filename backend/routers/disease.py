import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlmodel import Session, select

from auth import get_current_farmer
from db import get_session
from models import Farmer, Scan, Treatment
from schemas import ScanRead, ScanResult
from services.inference import band_for, predict

router = APIRouter(prefix="/disease", tags=["disease"])

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/predict", response_model=ScanResult)
async def predict_disease(
    file: UploadFile = File(...),
    batch_id: int | None = Form(default=None),
    session: Session = Depends(get_session),
    farmer: Farmer = Depends(get_current_farmer),
):
    image_bytes = await file.read()
    class_key, confidence, is_mock = predict(image_bytes)
    band = band_for(confidence)

    image_path = UPLOAD_DIR / f"{uuid.uuid4().hex}.jpg"
    image_path.write_bytes(image_bytes)

    scan = Scan(
        farmer_id=farmer.id,
        batch_id=batch_id,
        image_path=str(image_path),
        class_key=class_key,
        confidence=confidence,
        band=band,
        is_mock=is_mock,
    )
    session.add(scan)
    session.commit()
    session.refresh(scan)

    treatment = session.exec(
        select(Treatment).where(Treatment.class_key == class_key, Treatment.lang == farmer.language)
    ).first()
    label = treatment.display_name if treatment else class_key

    return ScanResult(
        class_key=class_key,
        label=label,
        confidence=confidence,
        band=band,
        is_mock=is_mock,
        scan_id=scan.id,
    )


@router.get("/scans", response_model=list[ScanRead])
def list_scans(
    session: Session = Depends(get_session),
    farmer: Farmer = Depends(get_current_farmer),
):
    return session.exec(
        select(Scan).where(Scan.farmer_id == farmer.id).order_by(Scan.created_at.desc())
    ).all()
