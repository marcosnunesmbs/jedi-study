import time
from agents.base import AgentResponse, build_usage, get_client
from agents.safety.output_schema import SafetyOutput
from agents.safety.prompts import SYSTEM_PROMPT, build_prompt
from config import settings


async def generate_safety_report(user_input: str, model: str = "") -> AgentResponse:
    client = get_client()
    prompt = build_prompt(user_input)

    # Use model from request if provided, else fallback to safety model or default
    model_name = model or settings.gemini_model_safety or settings.gemini_model

    start_time = time.time()
    response = await client.aio.models.generate_content(
        model=model_name,
        contents=prompt,
        config={
            "system_instruction": SYSTEM_PROMPT,
            "response_mime_type": "application/json",
            "response_json_schema": SafetyOutput.model_json_schema(),
            "temperature": 0.0,  # Zero for consistent results
        },
    )

    output = SafetyOutput.model_validate_json(response.text)
    usage = build_usage(response, start_time, model_name=model_name)

    return AgentResponse(data=output.model_dump(), usage=usage)
