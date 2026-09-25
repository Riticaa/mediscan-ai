import json
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, Text, DateTime, Float, Integer

from database import Base, engine, get_db

router = APIRouter(tags=["History"])


# ─── ORM Model ───────────────────────────────────────────────────────────────
class ReportRecord(Base):
    __tablename__ = "report_history"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename      = Column(String,  nullable=False)
    report_type   = Column(String,  nullable=False, default="GENERAL_PATHOLOGY")
    risk_badge    = Column(String,  nullable=False, default="Unknown")
    risk_score    = Column(Float,   nullable=True)
    health_score  = Column(Float,   nullable=True)
    language      = Column(String,  nullable=False, default="english")
    patient_name  = Column(String,  nullable=True)
    patient_age   = Column(Integer, nullable=True)
    patient_gender = Column(String, nullable=True)
    summary       = Column(Text,    nullable=True)
    analysis_json = Column(Text,    nullable=True)   # Full analysis payload as JSON
    created_at    = Column(DateTime, default=datetime.utcnow)


# Create table on startup
Base.metadata.create_all(bind=engine)


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────
class ReportListItem(BaseModel):
    id:            str
    filename:      str
    report_type:   str
    risk_badge:    str
    risk_score:    Optional[float]
    health_score:  Optional[float]
    language:      str
    patient_name:  Optional[str]
    patient_age:   Optional[int]
    patient_gender: Optional[str]
    summary:       Optional[str]
    created_at:    str

    class Config:
        from_attributes = True


class ReportDetail(ReportListItem):
    analysis: Optional[dict]


class SaveReportRequest(BaseModel):
    filename:     str
    language:     str
    analysis:     dict    # The full analysis object from /analyse/report


# ─── Routes ──────────────────────────────────────────────────────────────────
@router.post("/history/save", response_model=ReportListItem)
def save_report(payload: SaveReportRequest, db: Session = Depends(get_db)):
    """Persists an analysis result to the local SQLite history store."""
    a = payload.analysis

    pi = a.get("patient_info", {})
    record = ReportRecord(
        id             = str(uuid.uuid4()),
        filename       = payload.filename,
        report_type    = a.get("report_type", "GENERAL_PATHOLOGY"),
        risk_badge     = a.get("risk_badge", "Unknown"),
        risk_score     = a.get("risk_score"),
        health_score   = a.get("health_score"),
        language       = payload.language,
        patient_name   = pi.get("patient_name") or None,
        patient_age    = pi.get("age") or None,
        patient_gender = pi.get("gender") or None,
        summary        = a.get("summary", "")[:500] if a.get("summary") else None,
        analysis_json  = json.dumps(a),
        created_at     = datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return _to_list_item(record)


@router.get("/history", response_model=List[ReportListItem])
def get_history(limit: int = 20, db: Session = Depends(get_db)):
    """Returns the most recent reports ordered by date descending."""
    records = (
        db.query(ReportRecord)
        .order_by(ReportRecord.created_at.desc())
        .limit(min(limit, 50))
        .all()
    )
    return [_to_list_item(r) for r in records]


@router.get("/history/{report_id}", response_model=ReportDetail)
def get_report(report_id: str, db: Session = Depends(get_db)):
    """Returns the full analysis for a single saved report."""
    record = db.query(ReportRecord).filter(ReportRecord.id == report_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Report not found.")

    item = _to_list_item(record)
    analysis = {}
    if record.analysis_json:
        try:
            analysis = json.loads(record.analysis_json)
        except Exception:
            analysis = {}

    return ReportDetail(**item.dict(), analysis=analysis)


@router.delete("/history/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    """Deletes a report from history."""
    record = db.query(ReportRecord).filter(ReportRecord.id == report_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Report not found.")
    db.delete(record)
    db.commit()
    return {"success": True, "deleted_id": report_id}


@router.delete("/history")
def clear_history(db: Session = Depends(get_db)):
    """Clears all report history."""
    db.query(ReportRecord).delete()
    db.commit()
    return {"success": True, "message": "All history cleared."}


# ─── Helper ───────────────────────────────────────────────────────────────────
def _to_list_item(r: ReportRecord) -> ReportListItem:
    return ReportListItem(
        id             = r.id,
        filename       = r.filename,
        report_type    = r.report_type,
        risk_badge     = r.risk_badge,
        risk_score     = r.risk_score,
        health_score   = r.health_score,
        language       = r.language,
        patient_name   = r.patient_name,
        patient_age    = r.patient_age,
        patient_gender = r.patient_gender,
        summary        = r.summary,
        created_at     = r.created_at.isoformat() if r.created_at else "",
    )