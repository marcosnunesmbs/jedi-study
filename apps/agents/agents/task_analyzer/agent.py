import time
import google.generativeai as genai
from config import settings
from agents.base import AgentResponse, build_usage, extract_json
from agents.task_analyzer.output_schema import TaskAnalysisOutput
from agents.task_analyzer.prompts import SYSTEM_PROMPT, build_prompt


def create_model():
    genai.configure(api_key=settings.google_api_key)
    return genai.GenerativeModel(
        model_name=settings.gemini_model,
        system_instruction=SYSTEM_PROMPT,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.3,
        ),
    )


async def analyze_task(
    task_title: str,
    task_description: str,
    submission: str,
) -> AgentResponse:
    model = create_model()
    prompt = build_prompt(task_title, task_description, submission)

    start_time = time.time()
    response = model.generate_content(prompt)

    data = extract_json(response.text)
    if isinstance(data, list) and len(data) > 0:
        data = data[0]
    output = TaskAnalysisOutput(**data)

    usage = build_usage(response, start_time)

    return AgentResponse(data=output.model_dump(), usage=usage)
