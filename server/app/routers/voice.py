import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.models import User
from app.schemas.voice import VoiceTranscribeResponse
from app.security import get_current_user
from app.services.voice import transcribe_audio

logger = logging.getLogger(__name__)
router = APIRouter(tags=["voice"])


@router.post("/voice/transcribe", response_model=VoiceTranscribeResponse)
async def voice_transcribe(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> VoiceTranscribeResponse:
    audio_bytes = await file.read()
    mime_type = file.content_type or "audio/mp4"

    result = transcribe_audio(audio_bytes, mime_type)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not transcribe audio right now. Please try again.",
        )

    return VoiceTranscribeResponse(
        transcript=result.transcript,
        transcript_en=result.transcript_en,
        language_guess=result.language_guess,
    )
