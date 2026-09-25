from dataclasses import dataclass, field


@dataclass
class ReportSchema:

    report_metadata: dict = field(default_factory=dict)

    biomarkers: dict = field(default_factory=dict)

    health_score: dict = field(default_factory=dict)

    clinical_insights: list = field(default_factory=list)

    recommendations: list = field(default_factory=list)

    references: list = field(default_factory=list)

    ai_summary: str = ""