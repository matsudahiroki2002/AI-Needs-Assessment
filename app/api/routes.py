"""
HTTP routes exposing the backend capabilities.
"""
from __future__ import annotations

import logging
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.schemas.common import Contribution, Score
from app.schemas.idea import (
    Idea,
    IdeaCreate,
    Reaction,
    SimulationRequest,
    SimulationResult,
)
from app.schemas.project import Project, ProjectCreate
from app.services import gpt_adapter, simulate, statkit, store

log = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", tags=["system"])
def health() -> Dict[str, str]:
    return {"status": "ok"}


@router.get("/projects", response_model=List[Project])
def list_projects() -> List[Project]:
    return store.list_projects()


@router.post("/projects", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate) -> Project:
    return store.create_project(payload.name)


@router.get("/ideas", response_model=List[Idea])
def list_ideas(projectId: str | None = None) -> List[Idea]:
    ideas = store.list_ideas()
    if projectId:
        ideas = [idea for idea in ideas if idea.projectId == projectId]
    return ideas


@router.post("/ideas", response_model=Idea, status_code=status.HTTP_201_CREATED)
def create_idea(payload: IdeaCreate) -> Idea:
    return store.create_idea(payload)


class ScoreRequest(BaseModel):
    ideaIds: List[str]


@router.post("/ideas/score", response_model=List[Dict[str, object]])
def score_ideas(request: ScoreRequest) -> List[Dict[str, object]]:
    if not request.ideaIds:
        raise HTTPException(status_code=400, detail="ideaIds must not be empty.")

    results: List[Dict[str, object]] = []

    for idea_id in request.ideaIds:
        idea = store.get_idea(idea_id)
        if not idea:
            log.info("Idea not found for scoring id=%s", idea_id)
            continue

        insight = gpt_adapter.react(idea)
        score, contribution = statkit.compute_score(idea_id, insight, idea.projectId, idea.version)
        store.create_reaction(
            idea_id,
            {
                "projectId": idea.projectId,
                "version": idea.version,
                "personaId": "persona-gpt",
                "text": insight.get("reaction", ""),
                "likelihood": score.p_apply[1],
                "intent_to_try": insight.get("intent_to_try", 0.5),
                "segment": idea.target,
            },
        )
        results.append(
            {
                "projectId": idea.projectId,
                "version": idea.version,
                **score.model_dump(),
                "factors": [factor.model_dump() for factor in contribution.factors],
            }
        )

    if not results:
        raise HTTPException(status_code=404, detail="No ideas scored.")

    return results


@router.get("/ideas/{idea_id}/reactions", response_model=List[Reaction])
def list_reactions(idea_id: str, limit: int = Query(20, ge=1, le=50)) -> List[Reaction]:
    idea = store.get_idea(idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found.")
    return store.list_reactions(idea_id, limit=limit)


@router.post("/simulate", response_model=List[SimulationResult])
def run_simulation(payload: SimulationRequest) -> List[SimulationResult]:
    if not payload.ideaIds:
        raise HTTPException(status_code=400, detail="At least one ideaId required.")
    return simulate.simulate(payload)
