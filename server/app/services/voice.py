"""Speech-to-text via Gemini's audio understanding.

There is no on-device speech recognition available here: Expo Go can't load a
custom native STT module without a dev client build, and the Web Speech API
(SpeechRecognition) is browser-only — it doesn't exist in React Native's JS
runtime at all (unlike the web PWA, which uses it directly). Recording audio
with expo-audio and transcribing it server-side is the one path that actually
works in plain Expo Go.
"""

import base64
import json
import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

GEMINI_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

TRANSCRIBE_PROMPT = (
    "Transcribe this short voice clip from a farmer using an agricultural app. "
    "Give the transcript in the language actually spoken, and also an English "
    "translation of it so the app can route the request even if it wasn't in English."
)


class VoiceTranscriptionResult:
    def __init__(self, transcript: str, transcript_en: str, language_guess: str):
        self.transcript = transcript
        self.transcript_en = transcript_en
        self.language_guess = language_guess


def transcribe_audio(audio_bytes: bytes, mime_type: str) -> VoiceTranscriptionResult | None:
    """Returns None on any failure (missing key, network, malformed response) —
    the caller must degrade gracefully rather than break the voice screen."""
    settings = get_settings()
    if not settings.gemini_api_key:
        return None

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": TRANSCRIBE_PROMPT},
                    {"inline_data": {"mime_type": mime_type, "data": base64.b64encode(audio_bytes).decode()}},
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "transcript": {"type": "STRING"},
                    "transcript_en": {"type": "STRING"},
                    "language_guess": {"type": "STRING"},
                },
                "required": ["transcript", "transcript_en", "language_guess"],
            },
        },
    }

    url = GEMINI_URL_TEMPLATE.format(model=settings.gemini_model)
    for attempt in range(2):  # one retry — Gemini does occasionally 503 under load
        try:
            with httpx.Client(timeout=20) as client:
                resp = client.post(url, params={"key": settings.gemini_api_key}, json=payload)
                resp.raise_for_status()
                data = resp.json()
            text = data["candidates"][0]["content"]["parts"][-1]["text"]
            parsed = json.loads(text)
            return VoiceTranscriptionResult(
                transcript=parsed["transcript"],
                transcript_en=parsed["transcript_en"],
                language_guess=parsed.get("language_guess", ""),
            )
        except Exception as exc:
            logger.warning("voice transcription attempt %d failed: %s", attempt + 1, exc)
            if attempt == 1:
                return None
    return None
