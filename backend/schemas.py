from typing import List
from pydantic import BaseModel, Field

class TranslationOutput(BaseModel):
    literal_translation: str = Field(
        description="The direct translation text without any labels or prefixes"
    )
    cultural_notes: List[str] = Field(
        description="An array/list of structural friction points, idioms, or unit mismatches identified"
    )