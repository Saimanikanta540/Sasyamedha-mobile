import logging
from PIL import Image
import numpy as np

logger = logging.getLogger(__name__)

# Try importing the litert (tflite-runtime successor)
try:
    import ai_edge_litert.interpreter as tflite
    HAS_TFLITE = True
except ImportError:
    HAS_TFLITE = False
    logger.warning("ai-edge-litert not installed. Inference will be stubbed.")

class InferenceService:
    def __init__(self, model_path: str):
        self.classes = [
            "healthy", "early blight", "late blight", 
            "target spot", "yellow leaf curl virus", "mosaic virus"
        ]
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

    def predict(self, image: Image.Image) -> tuple[str, float]:
        if not self.interpreter:
            # Stub if model isn't available
            return "healthy", 0.95

        # Resize and normalize
        # Assuming MobileNetV2 expects 224x224 and [-1, 1] or [0, 1]
        # Let's assume standard 224x224 RGB [0, 1]
        target_size = (224, 224)
        image = image.resize(target_size).convert("RGB")
        input_data = np.array(image, dtype=np.float32) / 255.0
        input_data = np.expand_dims(input_data, axis=0)

        self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
        self.interpreter.invoke()
        output_data = self.interpreter.get_tensor(self.output_details[0]['index'])[0]

        top_index = np.argmax(output_data)
        confidence = float(output_data[top_index])
        
        # Guard against index out of bounds if model classes don't match
        if top_index < len(self.classes):
            disease_class = self.classes[top_index]
        else:
            disease_class = "unknown"

        return disease_class, confidence

# This will be initialized lazily or on startup
_inference_service = None

def get_inference_service(model_path: str) -> InferenceService:
    global _inference_service
    if _inference_service is None:
        _inference_service = InferenceService(model_path)
    return _inference_service
