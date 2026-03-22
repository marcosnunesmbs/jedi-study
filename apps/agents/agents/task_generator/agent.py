import time
from agents.base import AgentResponse, build_usage, get_client
from agents.task_generator.output_schema import TaskGenerationOutput
from agents.task_generator.prompts import SYSTEM_PROMPT, build_prompt
from config import settings


async def generate_tasks(
    phase_title: str,
    phase_description: str,
    topics: list[str],
    objectives: list[str],
    skill_level: str,
    contents: list[dict],
    model: str = "",
) -> AgentResponse:
    client = get_client()
    prompt = build_prompt(
        phase_title, phase_description, topics, objectives, skill_level, contents
    )

    model_name = model or settings.gemini_model

    start_time = time.time()
    response = await client.aio.models.generate_content(
        model=model_name,
        contents=prompt,
        config={
            "system_instruction": SYSTEM_PROMPT,
            "response_mime_type": "application/json",
            "response_json_schema": TaskGenerationOutput.model_json_schema(),
            "temperature": 0.5,
        },
    )

    output = TaskGenerationOutput.model_validate_json(response.text)
    usage = build_usage(response, start_time, model_name=model_name)

    return AgentResponse(data=output.model_dump(), usage=usage)
