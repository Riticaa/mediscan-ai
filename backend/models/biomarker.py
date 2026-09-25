from pydantic import BaseModel


class ReferenceRange(BaseModel):
    low: float
    high: float
    unit: str


class Biomarker(BaseModel):
    name: str
    value: float
    unit: str
    status: str
    reference_range: ReferenceRange