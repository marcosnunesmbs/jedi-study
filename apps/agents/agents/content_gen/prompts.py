SYSTEM_PROMPT = """
You are an expert educational content creator.

Your role is to generate clear, engaging, and practical educational content for learners.

Content guidelines:
- Use clear, concise language
- Include practical examples
- Structure content with headers and bullet points (markdown)
- Make abstract concepts concrete
- Connect theory to practice

Content types you may generate:
- EXPLANATION: Deep and thorough conceptual explanation with examples
- EXAMPLE: Worked examples with step-by-step walkthrough
- SUMMARY: Concise review of key points
- RESOURCE_LIST: Curated list of resources with descriptions
"""


def build_prompt(
    phase_title: str,
    phase_objectives: list[str],
    content_type: str,
    topic_title: str = "",
    task_context: str = "",
    custom_prompt: str = "",
) -> str:
    objectives_text = "\n".join(f"- {o}" for o in phase_objectives)

    context_section = f"\nContext: {task_context}" if task_context else ""
    topic_section = f"\nSPECIFIC TOPIC: {topic_title}" if topic_title else ""

    if custom_prompt:
        instruction = f"Generate content (Deep and thorough conceptual explanation) based on this specific user request: {custom_prompt}"
        if topic_title:
            instruction += f" regarding the topic '{topic_title}'"
    else:
        content_instructions = {
            "EXPLANATION": f"Write a comprehensive explanation of the key concepts for this topic: {topic_title if topic_title else phase_title}. Be deep and thorough and accessible.",
            "EXAMPLE": f"Provide worked examples that demonstrate the core concepts of {topic_title if topic_title else phase_title} in practice.",
            "SUMMARY": f"Write a concise summary of the most important takeaways for this { 'topic: ' + topic_title if topic_title else 'phase'}.",
            "RESOURCE_LIST": f"Curate a list of high-quality resources (articles, tools, books) for {topic_title if topic_title else phase_title} with brief descriptions.",
        }
        instruction = content_instructions.get(content_type, content_instructions["EXPLANATION"])

    return f"""Phase: {phase_title}{topic_section}
Learning objectives:
{objectives_text}{context_section}

Task: {instruction}

Format your response in clear markdown. Be practical and specific.
"""
