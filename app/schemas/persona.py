"""
Pydantic models representing persona profiles registered through the API.
"""
from __future__ import annotations

from typing import Dict, Literal, Optional

from pydantic import BaseModel, Field, validator

PersonaCategory = Literal[
    "大企業決裁者",
    "VC",
    "スタートアップ決裁者",
    "デザイナー",
    "学生",
    "主婦",
]


class PersonaBase(BaseModel):
    name: str = Field(..., max_length=120)
    category: PersonaCategory
    age: Optional[int] = Field(default=None, ge=0, le=120)
    gender: Optional[str] = Field(default=None, max_length=40)
    background: Optional[str] = Field(default=None, max_length=400)
    traits: Optional[Dict[str, float]] = None
    comment_style: Optional[str] = Field(default=None, max_length=60)

    @validator("traits", pre=True, always=True)
    def _normalise_traits(cls, value: Optional[Dict[str, float]]) -> Optional[Dict[str, float]]:
        if value is None:
            return None
        normalised: Dict[str, float] = {}
        for key, score in value.items():
            try:
                normalised[key] = max(0.0, min(1.0, float(score)))
            except (ValueError, TypeError):
                normalised[key] = 0.0
        return normalised


class PersonaCreate(PersonaBase):
    pass


class Persona(PersonaBase):
    id: str
    createdAt: str
    updatedAt: str
