import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.path_generator.agent import generate_study_path

logger = logging.getLogger(__name__)
router = APIRouter()


class PathGeneratorRequest(BaseModel):
    subjectTitle: str
    skillLevel: str
    goals: List[str]
    userContext: Optional[str] = None
    model: Optional[str] = None


@router.post("")
async def generate_path(req: PathGeneratorRequest):
    try:
        result = await generate_study_path(
            subject_title=req.subjectTitle,
            skill_level=req.skillLevel,
            goals=req.goals,
            user_context=req.userContext or "",
            model=req.model or ""
        )
        return result.model_dump()
    except Exception as e:
        logger.exception("Path generation failed")
        raise HTTPException(status_code=500, detail=str(e))
