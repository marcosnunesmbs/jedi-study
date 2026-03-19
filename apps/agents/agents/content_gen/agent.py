import time
from agents.base import AgentResponse, build_usage, get_client
from agents.content_gen.prompts import SYSTEM_PROMPT, build_prompt
from config import settings


async def generate_content(
    phase_title: str,
    phase_objectives: list[str],
    content_type: str,
    topic_title: str = "",
    task_context: str = "",
    custom_prompt: str = "",
) -> AgentResponse:
    client = get_client()
    prompt = build_prompt(phase_title, phase_objectives, content_type, topic_title, task_context, custom_prompt)

    start_time = time.time()
    response = await client.aio.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config={
            "system_instruction": SYSTEM_PROMPT,
            "temperature": 0.7,
        },
    )

    usage = build_usage(response, start_time)

    return AgentResponse(data=response.text.strip(), usage=usage)
