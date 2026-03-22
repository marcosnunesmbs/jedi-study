from typing import List, Optional
from pydantic import BaseModel, Field


class GeneratedTask(BaseModel):
    order: int = Field(..., ge=1)
    title: str
    type: str = Field(..., pattern="^(CONCEPTUAL|CODE_CHALLENGE|ANALYTICAL|MULTI_QUESTION)$")
    prompt: str
    expectedResponseFormat: str
    evaluationCriteria: List[str] = Field(..., min_length=1)
    hints: Optional[List[str]] = None


class TaskGenerationOutput(BaseModel):
    tasks: List[GeneratedTask] = Field(..., min_length=1)
