"""
Idea-centric schemas for request/response payloads.
"""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field, conlist, confloat, conint

from .common import CI


class IdeaBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=160)
    target: str = Field(..., min_length=2, max_length=160)
    pain: str = Field(..., min_length=2)
    solution: str = Field(..., min_length=2)
    price: conint(ge=0) = Field(..., description="税込JPY")
    channel: str = Field(..., min_length=2)
    onboarding: str = Field(..., min_length=2)


class IdeaCreate(IdeaBase):
    projectId: str = Field(..., min_length=2, max_length=64)
    version: Optional[str] = Field(default=None, max_length=16)


class Idea(IdeaBase):
    id: str
    projectId: str
    version: Optional[str] = None
    createdAt: str
    updatedAt: str


class Reaction(BaseModel):
    id: str
    ideaId: str
    projectId: str
    version: Optional[str] = None
    personaId: str
    text: str
    likelihood: confloat(ge=0, le=1)
    intent_to_try: confloat(ge=0, le=1)
    createdAt: str
    segment: Optional[str] = None


class SimulationRequest(BaseModel):
    ideaIds: conlist(str, min_length=1, max_length=3)
    filters: Optional[Dict[str, str | float]] = None


class SimulationPersonaReaction(BaseModel):
    personaId: str
    personaName: str
    category: str
    comment: str
    intent_to_try: confloat(ge=0, le=1)
    price_acceptance: confloat(ge=0, le=1)


class SimulationResult(BaseModel):
    ideaId: Optional[str] = None
    ideaTitle: Optional[str] = None
    projectId: Optional[str] = None
    version: Optional[str] = None
    psf: confloat(ge=0, le=100)
    pmf: confloat(ge=0, le=100)
    ci95: Optional[CI] = None
    personaReactions: List[SimulationPersonaReaction]
    summaryComment: str
