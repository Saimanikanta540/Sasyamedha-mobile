from uuid import UUID
from pydantic import BaseModel

class DiagnoseResponse(BaseModel):
    scan_id: UUID
    disease_class: str
    confidence: float
    is_mock: bool
