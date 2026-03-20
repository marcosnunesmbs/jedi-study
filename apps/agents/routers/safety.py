from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.safety.agent import generate_safety_report

router = APIRouter()


class SafetyCheckRequest(BaseModel):
    prompt: str


@router.post("")
async def check_safety(req: SafetyCheckRequest):
    try:
        result = await generate_safety_report(user_input=req.prompt)
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
