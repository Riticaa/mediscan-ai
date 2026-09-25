from pydantic import BaseModel
from typing import List


class ClinicalInsight(BaseModel):
    biomarker: str
    status: str
    clinical_significance: str
    follow_up: List[str]
    lifestyle: List[str]
    urgency: str