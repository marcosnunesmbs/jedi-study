import pytest
from pydantic import ValidationError
from agents.path_generator.output_schema import StudyPathOutput

def test_study_path_output_requires_welcome_message():
    data = {
        "subject": "Test Subject",
        "skillLevel": "BEGINNER",
        "estimatedHours": 10,
        "totalPhases": 1,
        "phases": [
            {
                "order": 1,
                "title": "Phase 1",
                "description": "Desc",
                "objectives": ["Obj"],
                "topics": ["Topic"],
                "estimatedHours": 5,
                "tasks": [
                    {"order": 1, "title": "Task 1", "description": "Desc", "type": "READING"}
                ]
            }
        ]
    }
    with pytest.raises(ValidationError):
        StudyPathOutput(**data)

def test_study_path_output_succeeds_with_welcome_message():
    data = {
        "subject": "Test Subject",
        "welcomeMessage": "Welcome! Let's start learning.",
        "skillLevel": "BEGINNER",
        "estimatedHours": 10,
        "totalPhases": 1,
        "phases": [
            {
                "order": 1,
                "title": "Phase 1",
                "description": "Desc",
                "objectives": ["Obj"],
                "topics": ["Topic"],
                "estimatedHours": 5,
                "tasks": [
                    {"order": 1, "title": "Task 1", "description": "Desc", "type": "READING"}
                ]
            }
        ]
    }
    output = StudyPathOutput(**data)
    assert output.welcomeMessage == "Welcome! Let's start learning."
