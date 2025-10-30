"""
Shared Pydantic models used across API endpoints.

These mirror the structures expected by the Next.js frontend to keep the
integration lightweight and type-safe.
"""
from __future__ import annotations

from typing import Literal, Tuple

from pydantic import BaseModel, Field, RootModel, conlist, confloat


class CI(BaseModel):
    low: confloat(ge=0, le=100) = Field(..., description="Lower bound of the 95% CI")
    high: confloat(ge=0, le=100) = Field(..., description="Upper bound of the 95% CI")


RangeTuple = Tuple[confloat(ge=0, le=1), confloat(ge=0, le=1)]


class Score(BaseModel):
    ideaId: str = Field(..., description="Identifier referencing the target idea")
    projectId: str | None = None
    version: str | None = None
    psf: confloat(ge=0, le=100)
    pmf: confloat(ge=0, le=100)
    ci95: CI
    p_apply: RangeTuple
    p_purchase: RangeTuple
    p_d7: RangeTuple
    verdict: Literal["Go", "Improve", "Kill"]


class ContributionFactor(BaseModel):
    name: str
    value: float


class Contribution(BaseModel):
    ideaId: str
    projectId: str | None = None
    version: str | None = None
    factors: conlist(ContributionFactor, min_length=1)
