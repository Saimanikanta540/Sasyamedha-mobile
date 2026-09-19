from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import TreatmentRecord
from app.schemas.treatment import TreatmentResponse

router = APIRouter(tags=["treatment"])

SUPPORTED_LANGUAGES = ("te", "en", "hi")


@router.get("/treatment/{disease_class}", response_model=TreatmentResponse)
def get_treatment(
    disease_class: str,
    lang: str = Query(..., pattern="^(te|en|hi)$"),
    session: Session = Depends(get_session),
) -> TreatmentResponse:
    """Read-only, DB-only (FR-TG-01) — this must never call an LLM or
    translation API. A missing language variant is a 404, never a silent
    fallback to English (FR-TG-04)."""
    record = session.exec(
        select(TreatmentRecord)
        .where(
            TreatmentRecord.disease_class == disease_class,
            TreatmentRecord.language == lang,
        )
        .order_by(TreatmentRecord.version.desc(), TreatmentRecord.created_at.desc())
    ).first()

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No treatment guidance for disease_class={disease_class!r} "
                f"language={lang!r}. Supported languages: {SUPPORTED_LANGUAGES}."
            ),
        )

    return TreatmentResponse(
        disease_class=record.disease_class,
        language=record.language,
        symptoms=record.symptoms,
        immediate_actions=record.immediate_actions,
        prevention=record.prevention,
        indicative_cost_min=record.indicative_cost_min,
        indicative_cost_max=record.indicative_cost_max,
        version=record.version,
    )
