from pydantic import BaseModel
from typing import Dict, List

from models.biomarker import Biomarker
from models.insight import ClinicalInsight
from models.health import HealthScore


class Report(BaseModel):

    report_type: str

    gender: str

    biomarkers: Dict[str, Biomarker]

    health_score: HealthScore | None = None

    clinical_insights: List[ClinicalInsight] = []

    recommendations: List[str] = []

    references: List[str] = []

    ai_summary: str = ""