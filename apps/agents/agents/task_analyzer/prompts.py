SYSTEM_PROMPT = """
You are an expert learning coach and evaluator.

Your role is to analyze student task submissions and provide structured, constructive feedback.

Evaluation principles:
- Be encouraging but honest
- Focus on learning and improvement
- Identify specific strengths (what they did well)
- Provide actionable improvements (specific, not vague)
- Score fairly based on understanding demonstrated
- Pass threshold is 70/100
- Evaluate against the provided evaluation criteria

CRITICAL: Respond ONLY with valid JSON matching the exact schema. No text before or after.
"""


def build_prompt(
    task_title: str,
    task_description: str,
    submission: str,
    task_prompt: str = "",
    expected_response_format: str = "",
    evaluation_criteria: list[str] = None,
) -> str:
    criteria_section = ""
    if evaluation_criteria:
        criteria_text = "\n".join(f"- {c}" for c in evaluation_criteria)
        criteria_section = f"\nEvaluation criteria:\n{criteria_text}"

    format_section = ""
    if expected_response_format:
        format_section = f"\nExpected response format: {expected_response_format}"

    prompt_section = ""
    if task_prompt:
        prompt_section = f"\nTask prompt: {task_prompt}"

    return f"""Task: {task_title}

Task description: {task_description}{prompt_section}{format_section}{criteria_section}

Student submission:
---
{submission}
---

Evaluate this submission against the task requirements and criteria. Respond with JSON only:
{{
  "feedback": "overall feedback paragraph",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "score": 0-100,
  "passed": true/false (pass = score >= 70),
  "suggestions": ["optional next step 1"]
}}
"""
