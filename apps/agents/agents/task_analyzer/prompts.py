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

CRITICAL: Respond ONLY with valid JSON matching the exact schema. No text before or after.
"""


def build_prompt(
    task_title: str,
    task_description: str,
    submission: str,
) -> str:
    return f"""Task: {task_title}

Task description: {task_description}

Student submission:
---
{submission}
---

Evaluate this submission. Respond with JSON only:
{{
  "feedback": "overall feedback paragraph",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "score": 0-100,
  "passed": true/false (pass = score >= 70),
  "suggestions": ["optional next step 1"]
}}
"""
