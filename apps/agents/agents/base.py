import time
from typing import Any, TypeVar, Type
from pydantic import BaseModel
from config import settings

T = TypeVar("T", bound=BaseModel)


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


def calculate_cost(input_tokens: int, output_tokens: int) -> float:
    input_cost = (input_tokens / 1_000_000) * settings.gemini_input_price_per_1m
    output_cost = (output_tokens / 1_000_000) * settings.gemini_output_price_per_1m
    return round(input_cost + output_cost, 8)


def build_usage(response, start_time: float) -> TokenUsageInfo:
    """Build TokenUsageInfo from a Gemini GenerateContentResponse."""
    usage_meta = getattr(response, "usage_metadata", None)
    input_tokens = getattr(usage_meta, "prompt_token_count", 0) or 0
    output_tokens = getattr(usage_meta, "candidates_token_count", 0) or 0
    total = input_tokens + output_tokens
    duration_ms = int((time.time() - start_time) * 1000)

    return TokenUsageInfo(
        model=settings.gemini_model,
        inputTokens=input_tokens,
        outputTokens=output_tokens,
        totalTokens=total,
        estimatedCostUsd=calculate_cost(input_tokens, output_tokens),
        durationMs=duration_ms,
    )
