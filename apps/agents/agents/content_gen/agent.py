import time
import google.generativeai as genai
from config import settings
from agents.base import AgentResponse, build_usage
from agents.content_gen.prompts import SYSTEM_PROMPT, build_prompt


def create_model():
    genai.configure(api_key=settings.google_api_key)
    return genai.GenerativeModel(
        model_name=settings.gemini_model,
        system_instruction=SYSTEM_PROMPT,
        generation_config=genai.GenerationConfig(
            temperature=0.7,
        ),
    )


async def generate_content(
    phase_title: str,
    phase_objectives: list[str],
    content_type: str,
    task_context: str = "",
    custom_prompt: str = "",
) -> AgentResponse:
    model = create_model()
    prompt = build_prompt(phase_title, phase_objectives, content_type, task_context, custom_prompt)

    start_time = time.time()
    response = model.generate_content(prompt)

    content_text = response.text.strip()

    usage = build_usage(response, start_time)

    return AgentResponse(data=content_text, usage=usage)
