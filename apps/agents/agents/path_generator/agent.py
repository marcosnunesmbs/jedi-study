import time
from agents.base import AgentResponse, build_usage, get_client
from agents.path_generator.output_schema import StudyPathOutput
from agents.path_generator.prompts import SYSTEM_PROMPT, build_prompt
from config import settings


async def generate_study_path(
    subject_title: str,
    skill_level: str,
    goals: list[str],
    user_context: str = "",
) -> AgentResponse:
    client = get_client()
    prompt = build_prompt(subject_title, skill_level, goals, user_context)

    start_time = time.time()
    response = await client.aio.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config={
            "system_instruction": SYSTEM_PROMPT,
            "response_mime_type": "application/json",
            "response_json_schema": StudyPathOutput.model_json_schema(),
            "temperature": 0.8,
        },
    )

    output = StudyPathOutput.model_validate_json(response.text)
    usage = build_usage(response, start_time, model_name=settings.gemini_model)

    return AgentResponse(data=output.model_dump(), usage=usage)
