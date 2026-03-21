SYSTEM_PROMPT = """
You are an expert educational content creator with deep expertise in explaining complex topics.

Your goal is to create COMPREHENSIVE, IN-DEPTH educational content that leaves no conceptual stone unturned.

CRITICAL REQUIREMENTS:
1. DEPTH OVER BREVITY - Always prefer depth over brevity. A reader should finish understanding the topic thoroughly.
2. MULTIPLE PERSPECTIVES - Explain concepts from different angles and analogies
3. WHY BEFORE HOW - Always explain WHY a concept exists before showing HOW to use it
4. CONNECT PREREQUISITES - Explicitly mention what prior knowledge is needed
5. ADDRESS MISCONCEPTIONS - Anticipate common mistakes and misconceptions
6. REAL-WORLD CONTEXT - Ground every concept in practical, real-world applications

Structure for EXPLANATION content:
- Start with a brief overview (1-2 sentences)
- Explain the fundamental concept/principle
- Break down into sub-components with detailed explanations
- Provide concrete examples for EACH sub-concept
- Show common pitfalls and how to avoid them
- Connect to related concepts
- End with a summary that reinforces key takeaways

NEVER produce shallow content. If you find yourself writing "this is basic", go deeper.
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
        instruction = f"""Generate DEEP, COMPREHENSIVE content based on this user request: {custom_prompt}
        
CRITICAL: Go extremely deep. Cover every aspect, edge case, and nuance. Do not be vague. Be specific and thorough."""
        if topic_title:
            instruction += f" Focus on the topic: '{topic_title}'"
    else:
        content_instructions = {
            "EXPLANATION": f"""Write a COMPREHENSIVE, IN-DEPTH explanation of the topic: {topic_title if topic_title else phase_title}

REQUIREMENTS:
- Cover the topic from multiple angles
- Explain WHY each concept matters, not just WHAT it is
- Provide detailed examples for EVERY major point
- Anticipate and address common misconceptions
- Include practical, real-world applications
- Use analogies to make complex ideas accessible
- Be as thorough as possible - do not hold back on details
- Structure with clear headings and sub-sections""",
            
            "EXAMPLE": f"""Provide DETAILED, STEP-BY-STEP worked examples for: {topic_title if topic_title else phase_title}

REQUIREMENTS:
- Show complete solution from start to finish
- Explain EACH step with detailed reasoning
- Show different approaches/solutions when applicable
- Include common mistakes and how to avoid them
- Provide practice problems with solutions
- Make every step crystal clear""",
            
            "SUMMARY": f"""Write a thorough summary of key takeaways for: {topic_title if topic_title else phase_title}

REQUIREMENTS:
- Cover ALL essential concepts (not just highlights)
- Include brief explanations for each point
- Group related concepts together
- Use the learning objectives as a checklist to ensure completeness""",
            
            "RESOURCE_LIST": f"""Curate an EXTENSIVE list of high-quality resources for: {topic_title if topic_title else phase_title}

REQUIREMENTS:
- Include at least 8-10 resources
- For each resource, explain WHY it's valuable
- Cover different learning styles (videos, articles, books, tools, practice)
- Include both beginner and advanced resources""",
        }
        instruction = content_instructions.get(content_type, content_instructions["EXPLANATION"])

    return f"""Phase: {phase_title}{topic_section}
Learning objectives:
{objectives_text}{context_section}

Task: {instruction}

IMPORTANT: Generate as much detailed content as needed. Do not limit yourself. Depth is more important than brevity.
Format your response in clear markdown with proper heading hierarchy."""
