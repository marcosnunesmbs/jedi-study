import time
import google.generativeai as genai
from config import settings
from agents.base import AgentResponse, build_usage, extract_json
from agents.path_generator.output_schema import StudyPathOutput
from agents.path_generator.prompts import SYSTEM_PROMPT, build_prompt


def create_model():
    genai.configure(api_key=settings.google_api_key)
    return genai.GenerativeModel(
        model_name=settings.gemini_model,
        system_instruction=SYSTEM_PROMPT,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.8,
        ),
    )


async def generate_study_path(
    subject_title: str,
    skill_level: str,
    goals: list[str],
    user_context: str = "",
) -> AgentResponse:
    model = create_model()
    prompt = build_prompt(subject_title, skill_level, goals, user_context)

    start_time = time.time()
    response = model.generate_content(prompt)

    data = extract_json(response.text)

    # Gemini may wrap the response in an array
    if isinstance(data, list) and len(data) > 0:
        data = data[0]

    # Validate with Pydantic
    output = StudyPathOutput(**data)

    usage = build_usage(response, start_time)

    return AgentResponse(data=output.model_dump(), usage=usage)
