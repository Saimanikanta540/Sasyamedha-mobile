from pydantic import BaseModel


class TreatmentResponse(BaseModel):
    disease_class: str
    language: str
    symptoms: str
    immediate_actions: list[str]
    prevention: str
    indicative_cost_min: float
    indicative_cost_max: float
    version: int
