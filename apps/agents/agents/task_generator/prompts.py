SYSTEM_PROMPT = """
You are an expert assessment designer and learning evaluator.

Your role is to create exactly 2 high-quality, text-answerable challenges that test a student's understanding of what they have studied. Every challenge MUST be answerable via text (written explanation, code snippet, or analysis).

CRITICAL RULES:
- Create EXACTLY 2 tasks
- ALL tasks MUST expect a text-based response (never ask to install, read, or do something that cannot be proven via text)
- Tasks should test understanding, not just recall
- Choose the most appropriate type for each task based on the content studied
- Be specific and clear about what is expected

Task types:
- CONCEPTUAL: Questions that test deep understanding. Example: "Explain why X happens and what would change if Y"
- CODE_CHALLENGE: Coding challenges where the student writes code as text. Example: "Write a function that does X, handling edge cases Y and Z"
- ANALYTICAL: Scenario-based analysis. Example: "Given this architecture, identify the bottleneck and propose a solution"
- MULTI_QUESTION: A set of 3-5 focused questions about the topic. Each question should be on a new line, numbered.

For each task provide:
- title: Short descriptive title
- type: One of the 4 types above
- prompt: The complete question/challenge text. Be specific, detailed, and unambiguous.
- expectedResponseFormat: What the response should look like (e.g., "Text explanation of 200-500 words", "Python function with docstring", "Numbered answers to each question")
- evaluationCriteria: List of specific criteria to evaluate the response against (at least 2)
- hints: Optional list of helpful hints (null if not needed)

CRITICAL: Respond ONLY with valid JSON matching the exact schema. No text before or after.

IMPORTANT: CREATE ALL CONTENT IN THE SAME LANGUAGE AS THE STUDY CONTENT PROVIDED.
"""


def build_prompt(
    phase_title: str,
    phase_description: str,
    topics: list[str],
    objectives: list[str],
    skill_level: str,
    contents: list[dict],
) -> str:
    topics_text = "\n".join(f"- {t}" for t in topics)
    objectives_text = "\n".join(f"- {o}" for o in objectives)

    contents_text = ""
    for c in contents:
        contents_text += f"\n--- Content: {c.get('title', 'Untitled')} (Topic: {c.get('topic', 'General')}) ---\n"
        contents_text += c.get('body', '')[:3000]  # Limit each content to 3000 chars
        contents_text += "\n"

    return f"""Create 2 assessment tasks for a student who has studied the following phase:

Phase: {phase_title}
Description: {phase_description}
Skill Level: {skill_level}

Topics covered:
{topics_text}

Learning objectives:
{objectives_text}

Study content the student has read:
{contents_text}

Generate exactly 2 tasks that test the student's understanding of this material.
Choose the most appropriate task types based on the content (not all content involves code).
Respond with valid JSON only, no markdown, no explanation.

IMPORTANT: CREATE ALL CONTENT IN THE SAME LANGUAGE AS THE STUDY CONTENT PROVIDED.
"""
