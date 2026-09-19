import logging
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Scan, User
from app.schemas.scan import ScanResponse
from app.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(tags=["scan_history"])

@router.get("/scan-history", response_model=list[ScanResponse])
def get_scan_history(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> list[ScanResponse]:
    scans = session.exec(
        select(Scan)
        .where(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
    ).all()
    
    return [
        ScanResponse(
            id=s.id,
            image_url=s.image_url,
            disease_class=s.disease_class,
            confidence=s.confidence,
            created_at=s.created_at
        ) for s in scans
    ]
