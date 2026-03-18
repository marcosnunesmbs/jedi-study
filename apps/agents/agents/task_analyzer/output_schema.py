from typing import List, Optional
from pydantic import BaseModel, Field


class TaskAnalysisOutput(BaseModel):
    feedback: str
    strengths: List[str]
    improvements: List[str]
    score: int = Field(..., ge=0, le=100)
    passed: bool
    suggestions: Optional[List[str]] = None
