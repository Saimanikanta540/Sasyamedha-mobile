from pydantic import BaseModel


class VoiceTranscribeResponse(BaseModel):
    transcript: str
    transcript_en: str
    language_guess: str
