import base64
import hashlib
import io
import json
import os
import random
from pathlib import Path

import httpx
from dotenv import load_dotenv
from PIL import Image

load_dotenv(Path(__file__).parent.parent / ".env")

CLASSES = [
    "healthy",
    "early_blight",
    "late_blight",
    "target_spot",
    "yellow_leaf_curl_virus",
    "mosaic_virus",
]

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)

GEMINI_PROMPT = (
    "You are an expert plant pathologist. Look at this photo of a tomato leaf and "
    "classify it into exactly one of these six classes: healthy, early_blight, "
    "late_blight, target_spot, yellow_leaf_curl_virus, mosaic_virus. "
    "Base the confidence only on how clearly the photo shows that class's symptoms."
)

_MODEL_PATH = Path(__file__).parent.parent / "models" / "model.tflite"
_tflite_interpreter = None

try:
    if _MODEL_PATH.exists():
        try:
            from ai_edge_litert.interpreter import Interpreter  # type: ignore
        except ImportError:
            from tflite_runtime.interpreter import Interpreter  # type: ignore
        _tflite_interpreter = Interpreter(model_path=str(_MODEL_PATH))
        _tflite_interpreter.allocate_tensors()
except Exception:
    _tflite_interpreter = None


def _band(confidence: float) -> str:
    if confidence >= 0.85:
        return "high"
    if confidence >= 0.60:
        return "medium"
    return "low"


def _heuristic_predict(image_bytes: bytes) -> tuple[str, float]:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((128, 128))
    hsv = img.convert("HSV")
    pixels = list(hsv.getdata())
    n = len(pixels)

    hues = [p[0] * 360 / 255 for p in pixels]
    vals = [p[2] / 255 for p in pixels]

    green = sum(1 for h in hues if 60 <= h <= 160) / n
    brown = sum(1 for h, v in zip(hues, vals) if 10 <= h <= 45 and v < 0.55) / n
    dark = sum(1 for v in vals if v < 0.30) / n
    yellow = sum(1 for h in hues if 45 <= h <= 65) / n

    mean_h = sum(hues) / n
    hue_var = sum((h - mean_h) ** 2 for h in hues) / n

    edges = 0
    for y in range(1, 127):
        for x in range(1, 127):
            i = y * 128 + x
            edges += abs(vals[i] - vals[i - 1]) + abs(vals[i] - vals[i - 128])
    edge_var = edges / (126 * 126)

    seed = int(hashlib.sha256(image_bytes).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)

    if green > 0.75 and brown < 0.05:
        return "healthy", rng.uniform(0.88, 0.94)
    if brown > 0.15 and dark > 0.10:
        return "late_blight", rng.uniform(0.68, 0.83)
    if brown > 0.12:
        return "early_blight", rng.uniform(0.72, 0.86)
    if yellow > 0.15 and edge_var > 0.02:
        return "yellow_leaf_curl_virus", rng.uniform(0.64, 0.80)
    if hue_var > 3000:
        return "mosaic_virus", rng.uniform(0.60, 0.75)
    return "target_spot", rng.uniform(0.42, 0.58)


def _gemini_predict(image_bytes: bytes) -> tuple[str, float] | None:
    """Real vision classification via the Gemini API. Returns None on any failure
    (network, rate limit, malformed response) so the caller can fall back cleanly —
    a flaky external API must never break the scan flow."""
    if not GEMINI_API_KEY:
        return None

    img_b64 = base64.b64encode(image_bytes).decode()
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": GEMINI_PROMPT},
                    {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}},
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
                "type": "OBJECT",
                "properties": {
                    "class_key": {"type": "STRING", "enum": CLASSES},
                    "confidence": {"type": "NUMBER"},
                },
                "required": ["class_key", "confidence"],
            },
        },
    }

    # One retry: Gemini occasionally returns a transient 503 under load, and a
    # single retry is cheap insurance against falling back unnecessarily.
    for attempt in range(2):
        try:
            with httpx.Client(timeout=20) as client:
                resp = client.post(GEMINI_URL, params={"key": GEMINI_API_KEY}, json=payload)
                resp.raise_for_status()
                data = resp.json()
            text = data["candidates"][0]["content"]["parts"][-1]["text"]
            parsed = json.loads(text)
            class_key = parsed["class_key"]
            confidence = float(parsed["confidence"])
            if class_key not in CLASSES:
                return None
            return class_key, max(0.0, min(1.0, confidence))
        except Exception:
            if attempt == 1:
                return None
    return None


def predict(image_bytes: bytes) -> tuple[str, float, bool]:
    """Returns (class_key, confidence 0..1, is_mock)."""
    if _tflite_interpreter is not None:
        # Real-model path left in place; not exercised without models/model.tflite.
        input_details = _tflite_interpreter.get_input_details()
        output_details = _tflite_interpreter.get_output_details()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
        import numpy as np  # local import: only needed on the real-model path

        arr = (np.asarray(img, dtype="float32") / 255.0)[None, ...]
        _tflite_interpreter.set_tensor(input_details[0]["index"], arr)
        _tflite_interpreter.invoke()
        output = _tflite_interpreter.get_tensor(output_details[0]["index"])[0]
        idx = int(output.argmax())
        return CLASSES[idx], float(output[idx]), False

    gemini_result = _gemini_predict(image_bytes)
    if gemini_result is not None:
        class_key, confidence = gemini_result
        return class_key, round(confidence, 4), False

    class_key, confidence = _heuristic_predict(image_bytes)
    return class_key, round(confidence, 4), True


def band_for(confidence: float) -> str:
    return _band(confidence)
