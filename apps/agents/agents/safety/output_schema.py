from pydantic import BaseModel

class SafetyOutput(BaseModel):
    safe_prompt: bool
    reason: str = ""
