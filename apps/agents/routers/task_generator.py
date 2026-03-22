from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.task_generator.agent import generate_tasks

router = APIRouter()


class TaskGeneratorRequest(BaseModel):
    phaseTitle: str
    phaseDescription: str
    topics: List[str]
    objectives: List[str]
    skillLevel: str
    contents: List[Dict[str, Any]]
    model: Optional[str] = None


@router.post("")
async def generate(req: TaskGeneratorRequest):
    try:
        result = await generate_tasks(
            phase_title=req.phaseTitle,
            phase_description=req.phaseDescription,
            topics=req.topics,
            objectives=req.objectives,
            skill_level=req.skillLevel,
            contents=req.contents,
            model=req.model or "",
        )
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
