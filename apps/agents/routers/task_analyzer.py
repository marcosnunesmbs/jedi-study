from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.task_analyzer.agent import analyze_task

router = APIRouter()


class TaskAnalyzerRequest(BaseModel):
    taskTitle: str
    taskDescription: str
    taskType: str
    submissionContent: str
    model: Optional[str] = None


@router.post("")
async def analyze(req: TaskAnalyzerRequest):
    try:
        result = await analyze_task(
            task_title=req.taskTitle,
            task_description=req.taskDescription,
            submission=req.submissionContent,
            model=req.model or ""
        )
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
