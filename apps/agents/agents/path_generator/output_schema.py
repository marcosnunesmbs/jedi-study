from typing import List
from pydantic import BaseModel, Field


class PathPhase(BaseModel):
    order: int = Field(..., ge=1)
    title: str
    description: str
    objectives: List[str] = Field(..., min_length=1)
    topics: List[str] = Field(..., min_length=1)
    estimatedHours: int = Field(..., ge=1)


class StudyPathOutput(BaseModel):
    subject: str
    welcomeMessage: str = Field(..., description="A motivating and instructive greeting for the user")
    skillLevel: str = Field(..., pattern="^(BEGINNER|INTERMEDIATE|ADVANCED)$")
    estimatedHours: int = Field(..., ge=1)
    totalPhases: int = Field(..., ge=1)
    phases: List[PathPhase] = Field(..., min_length=1)
