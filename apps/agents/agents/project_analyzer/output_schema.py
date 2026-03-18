from typing import List, Optional
from pydantic import BaseModel, Field


class ProjectAnalysisOutput(BaseModel):
    feedback: str
    strengths: List[str]
    improvements: List[str]
    score: int = Field(..., ge=0, le=100)
    passed: bool
    technicalAssessment: Optional[str] = None
    architectureNotes: Optional[List[str]] = None
