from typing import TypedDict

class AgentState(TypedDict):
    source_text: str
    target_language: str
    target_culture: str
    literal_translation: str
    cultural_notes: str
    search_context: str
    final_output: str