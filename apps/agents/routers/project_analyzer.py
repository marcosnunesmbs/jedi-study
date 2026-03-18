from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.project_analyzer.agent import analyze_project

router = APIRouter()


class ProjectAnalyzerRequest(BaseModel):
    taskTitle: str
    taskDescription: str
    taskType: str
    submissionContent: str
    projectContext: Optional[Dict[str, Any]] = None


@router.post("")
async def analyze(req: ProjectAnalyzerRequest):
    try:
        result = await analyze_project(
            task_title=req.taskTitle,
            task_description=req.taskDescription,
            submission=req.submissionContent,
            project_context=req.projectContext,
        )
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
