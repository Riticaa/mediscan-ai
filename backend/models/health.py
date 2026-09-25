from pydantic import BaseModel


class HealthScore(BaseModel):
    score: int
    overall_status: str
    priority: str
    normal_parameters: int
    abnormal_parameters: int