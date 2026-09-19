import base64
import io
import logging

import numpy as np
from PIL import Image

from app.services.gemini_client import call_gemini

logger = logging.getLogger(__name__)

# Underscored to match TreatmentRecord.disease_class exactly (see
# app/seed/treatment_seed.py) — treatment lookup is an exact string match,
# never a fuzzy one, so any mismatch here 404s every treatment lookup.
CLASSES = ["healthy", "early_blight", "late_blight", "target_spot", "yellow_leaf_curl_virus", "mosaic_virus"]

# Try importing the litert (tflite-runtime successor)
try:
    import ai_edge_litert.interpreter as tflite

    HAS_TFLITE = True
except ImportError:
    HAS_TFLITE = False
    logger.warning("ai-edge-litert not installed. Falling back to Gemini Vision / stub inference.")

DIAGNOSE_PROMPT = (
    "You are an expert plant pathologist. Look at this photo of a tomato leaf and "
    "classify it into exactly one of these six classes: "
    + ", ".join(CLASSES)
    + ". Base the confidence only on how clearly the photo shows that class's symptoms."
)


def _gemini_predict(image: Image.Image) -> tuple[str, float] | None:
    """Real vision classification via the Gemini API. Returns None on any failure
    (no key configured, network, rate limit, malformed response) so the caller
    can fall back cleanly — a flaky external API must never break the scan flow."""
    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="JPEG", quality=85)
    image_b64 = base64.b64encode(buf.getvalue()).decode()

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": DIAGNOSE_PROMPT},
                    {"inline_data": {"mime_type": "image/jpeg", "data": image_b64}},
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

    parsed = call_gemini(payload)
    if parsed is None:
        return None
    class_key = parsed["class_key"]
    confidence = float(parsed["confidence"])
    if class_key not in CLASSES:
        return None
    return class_key, max(0.0, min(1.0, confidence))


class InferenceService:
    def __init__(self, model_path: str):
        self.classes = CLASSES
        self.model_path = model_path
        self.interpreter = None
        self.input_details = None
        self.output_details = None

        if HAS_TFLITE and self.model_path:
            try:
                self.interpreter = tflite.Interpreter(model_path=self.model_path)
                self.interpreter.allocate_tensors()
                self.input_details = self.interpreter.get_input_details()
                self.output_details = self.interpreter.get_output_details()
                logger.info(f"Loaded TFLite model from {model_path}")
            except Exception as e:
                logger.error(f"Failed to load TFLite model: {e}")
                self.interpreter = None

    def predict(self, image: Image.Image) -> tuple[str, float, bool]:
        """Returns (disease_class, confidence, is_mock). is_mock is True only
        for the last-resort hardcoded fallback — never hide that from the
        caller/client, same principle as the web PWA's demo-model chip."""
        if self.interpreter:
            target_size = (224, 224)
            resized = image.resize(target_size).convert("RGB")
            input_data = np.array(resized, dtype=np.float32) / 255.0
            input_data = np.expand_dims(input_data, axis=0)

            self.interpreter.set_tensor(self.input_details[0]["index"], input_data)
            self.interpreter.invoke()
            output_data = self.interpreter.get_tensor(self.output_details[0]["index"])[0]

            top_index = np.argmax(output_data)
            confidence = float(output_data[top_index])
            disease_class = self.classes[top_index] if top_index < len(self.classes) else "unknown"
            return disease_class, confidence, False

        gemini_result = _gemini_predict(image)
        if gemini_result is not None:
            return gemini_result[0], gemini_result[1], False

        # Last resort: no trained model, no Gemini key/response. Never crash the
        # scan flow — but the caller must surface is_mock so this is never
        # presented to a farmer as a real diagnosis.
        return "healthy", 0.95, True


# This will be initialized lazily or on startup
_inference_service = None


def get_inference_service(model_path: str) -> InferenceService:
    global _inference_service
    if _inference_service is None:
        _inference_service = InferenceService(model_path)
    return _inference_service
