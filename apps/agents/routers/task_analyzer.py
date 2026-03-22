from typing import Optional, List
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
    taskPrompt: Optional[str] = None
    expectedResponseFormat: Optional[str] = None
    evaluationCriteria: Optional[List[str]] = None


@router.post("")
async def analyze(req: TaskAnalyzerRequest):
    try:
        result = await analyze_task(
            task_title=req.taskTitle,
            task_description=req.taskDescription,
            submission=req.submissionContent,
            model=req.model or "",
            task_prompt=req.taskPrompt or "",
            expected_response_format=req.expectedResponseFormat or "",
            evaluation_criteria=req.evaluationCriteria,
        )
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
