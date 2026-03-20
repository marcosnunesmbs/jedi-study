import time
from typing import Any
from pydantic import BaseModel
from google import genai
from config import settings


def get_client() -> genai.Client:
    return genai.Client(api_key=settings.google_api_key)


class TokenUsageInfo(BaseModel):
    model: str
    inputTokens: int
    outputTokens: int
    totalTokens: int
    estimatedCostUsd: float
    durationMs: int


class AgentResponse(BaseModel):
    data: Any
    usage: TokenUsageInfo


def calculate_cost(input_tokens: int, output_tokens: int, model: str = "") -> float:
    # Default prices
    input_price = settings.gemini_input_price_per_1m
    output_price = settings.gemini_output_price_per_1m

    # If it is the safety model, use safety prices
    if settings.gemini_model_safety and model == settings.gemini_model_safety:
        input_price = settings.gemini_safety_input_price_per_1m
        output_price = settings.gemini_safety_output_price_per_1m

    input_cost = (input_tokens / 1_000_000) * input_price
    output_cost = (output_tokens / 1_000_000) * output_price
    return round(input_cost + output_cost, 8)


def build_usage(response, start_time: float, model_name: str = "") -> TokenUsageInfo:
    usage_meta = getattr(response, "usage_metadata", None)
    input_tokens = getattr(usage_meta, "prompt_token_count", 0) or 0
    output_tokens = getattr(usage_meta, "candidates_token_count", 0) or 0
    total = input_tokens + output_tokens
    duration_ms = int((time.time() - start_time) * 1000)

    # Use explicitly passed model, or try to extract from response, or fallback to default
    final_model = model_name or getattr(response, "model", "") or settings.gemini_model

    return TokenUsageInfo(
        model=final_model,
        inputTokens=input_tokens,
        outputTokens=output_tokens,
        totalTokens=total,
        estimatedCostUsd=calculate_cost(input_tokens, output_tokens, model=final_model),
        durationMs=duration_ms,
    )
