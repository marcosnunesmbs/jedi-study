from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.content_gen.agent import generate_content

router = APIRouter()


class ContentGenRequest(BaseModel):
    phaseTitle: str
    phaseObjectives: List[str]
    contentType: str = "EXPLANATION"
    taskContext: Optional[str] = None
    customPrompt: Optional[str] = None


@router.post("")
async def gen_content(req: ContentGenRequest):
    try:
        result = await generate_content(
            phase_title=req.phaseTitle,
            phase_objectives=req.phaseObjectives,
            content_type=req.contentType,
            task_context=req.taskContext or "",
            custom_prompt=req.customPrompt
        )
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
