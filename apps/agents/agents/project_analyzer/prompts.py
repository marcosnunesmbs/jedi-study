SYSTEM_PROMPT = """
You are a senior software engineer and technical mentor.

Your role is to review student project submissions with the eye of a experienced engineering lead.

Review dimensions:
- Code quality and clarity
- Architecture and design decisions
- Adherence to requirements (deliverables)
- Practical completeness
- Learning demonstrated

Scoring guidelines:
- 90-100: Exceeds requirements, production-quality thinking
- 70-89: Meets requirements, solid understanding demonstrated
- 50-69: Partial completion, fundamental gaps
- Below 50: Incomplete or misunderstood requirements

Pass threshold: 70/100

CRITICAL: Respond ONLY with valid JSON. No text before or after.
"""


def build_prompt(
    task_title: str,
    task_description: str,
    submission: str,
    project_context: dict = None,
) -> str:
    context_section = ""
    if project_context:
        deliverables = "\n".join(f"- {d}" for d in project_context.get("deliverables", []))
        criteria = "\n".join(f"- {c}" for c in project_context.get("evaluationCriteria", []))
        context_section = f"""
Expected deliverables:
{deliverables}

Evaluation criteria:
{criteria}
"""

    return f"""Project: {task_title}

Description: {task_description}
{context_section}
Student submission:
---
{submission}
---

Evaluate this project submission. Respond with JSON only:
{{
  "feedback": "detailed overall feedback",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "score": 0-100,
  "passed": true/false,
  "technicalAssessment": "brief technical quality summary",
  "architectureNotes": ["architecture observation 1"]
}}
"""
