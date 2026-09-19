"""Shared Gemini generateContent caller for the two features that depend on it
(disease diagnosis, voice transcription) — both need the same resilience
against Gemini's flash tier occasionally returning 503 UNAVAILABLE / "high
demand" (observed directly while building this), which is external
infrastructure load, not something fixable from this app's side. The only
lever available here is retrying with backoff before giving up and falling
back to whatever degraded path the caller has (a stub diagnosis, a clear
error on the voice screen) — never presenting a raw failure as a hang.
"""

import json
import logging
import time

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

GEMINI_URL_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

MAX_ATTEMPTS = 3
BACKOFF_SECONDS = [1, 2]  # between attempts 1->2 and 2->3


def call_gemini(payload: dict, *, timeout: float = 20) -> dict | None:
    """Returns the parsed JSON from the first `parts[-1].text` field (every
    caller here uses responseMimeType: application/json), or None if every
    attempt failed. Never raises — callers must have their own fallback."""
    settings = get_settings()
    if not settings.gemini_api_key:
        return None

    url = GEMINI_URL_TEMPLATE.format(model=settings.gemini_model)
    last_error: Exception | None = None

    for attempt in range(MAX_ATTEMPTS):
        try:
            with httpx.Client(timeout=timeout) as client:
                resp = client.post(url, params={"key": settings.gemini_api_key}, json=payload)
                resp.raise_for_status()
                data = resp.json()
            text = data["candidates"][0]["content"]["parts"][-1]["text"]
            return json.loads(text)
        except Exception as exc:
            last_error = exc
            logger.warning("gemini call attempt %d/%d failed: %s", attempt + 1, MAX_ATTEMPTS, exc)
            if attempt < MAX_ATTEMPTS - 1:
                time.sleep(BACKOFF_SECONDS[attempt])

    logger.error("gemini call gave up after %d attempts: %s", MAX_ATTEMPTS, last_error)
    return None
