from fastapi import APIRouter, HTTPException
from services.risk_scorer import calculate_risk_score
from pydantic import BaseModel
from typing import Any

router = APIRouter(prefix="/risk", tags=["Risk"])

class AnalysisInput(BaseModel):
    analysis: dict[str, Any]

@router.post("/score")
def score_report(input: AnalysisInput):
    """
    Takes an analysis JSON from /analyse/report
    and returns it enriched with a risk score.
    """
    try:
        scored = calculate_risk_score(input.analysis)
        return {
            "status": "success",
            "scored_analysis": scored
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))