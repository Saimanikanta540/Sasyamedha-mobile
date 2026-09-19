from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class ScanResponse(BaseModel):
    id: UUID
    image_url: str
    disease_class: str
    confidence: float
    created_at: datetime
