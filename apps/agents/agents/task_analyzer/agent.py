import time
from agents.base import AgentResponse, build_usage, get_client
from agents.task_analyzer.output_schema import TaskAnalysisOutput
from agents.task_analyzer.prompts import SYSTEM_PROMPT, build_prompt
from config import settings


async def analyze_task(
    task_title: str,
    task_description: str,
    submission: str,
) -> AgentResponse:
    client = get_client()
    prompt = build_prompt(task_title, task_description, submission)

    start_time = time.time()
    response = await client.aio.models.generate_content(
        model=settings.gemini_model,
        contents=prompt,
        config={
            "system_instruction": SYSTEM_PROMPT,
            "response_mime_type": "application/json",
            "response_json_schema": TaskAnalysisOutput.model_json_schema(),
            "temperature": 0.3,
        },
    )

    output = TaskAnalysisOutput.model_validate_json(response.text)
    usage = build_usage(response, start_time)

    return AgentResponse(data=output.model_dump(), usage=usage)
