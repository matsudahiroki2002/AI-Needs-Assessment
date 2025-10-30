"""
Simple in-memory persistence layer.

This module keeps the mock backend state in memory so that the UI can interact
with stateful endpoints without requiring an external database.
"""
from __future__ import annotations

import itertools
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional
import re

from app.schemas.idea import Idea, IdeaCreate, Reaction
from app.schemas.persona import Persona, PersonaCreate
from app.schemas.project import Project

log = logging.getLogger(__name__)

IDEA_PREFIX = "idea"
REACTION_PREFIX = "reaction"

_projects: Dict[str, Project] = {}
_ideas: Dict[str, Idea] = {}
_reactions: Dict[str, List[Reaction]] = {}
_personas: Dict[str, Persona] = {}
_idea_counter = itertools.count(1000)
_reaction_counter = itertools.count(1000)
_project_counter = itertools.count(1000)
_persona_counter = itertools.count(1)


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def reset_store() -> None:
    """Used by tests to ensure a clean state."""
    _projects.clear()
    _ideas.clear()
    _reactions.clear()
    _personas.clear()


def upsert_ideas(seed: Iterable[Idea]) -> None:
    for idea in seed:
        _ideas[idea.id] = idea
        _reactions.setdefault(idea.id, [])


def upsert_projects(seed: Iterable[Project]) -> None:
    for project in seed:
        _projects[project.id] = project


def upsert_personas(seed: Iterable[Persona]) -> None:
    for persona in seed:
        _personas[persona.id] = persona


def list_projects() -> List[Project]:
    return sorted(_projects.values(), key=lambda item: item.updatedAt, reverse=True)


def create_project(name: str) -> Project:
    slug = _slugify(name)
    base_slug = slug
    idx = 1
    while slug in _projects:
        slug = f"{base_slug}-{idx}"
        idx += 1
    now = _now_iso()
    project = Project(id=slug, name=name.strip(), createdAt=now, updatedAt=now)
    _projects[slug] = project
    return project


def add_reactions(idea_id: str, reactions: Iterable[Reaction]) -> None:
    bucket = _reactions.setdefault(idea_id, [])
    bucket.extend(reactions)


def list_ideas() -> List[Idea]:
    return sorted(_ideas.values(), key=lambda item: item.updatedAt, reverse=True)


def get_idea(idea_id: str) -> Optional[Idea]:
    return _ideas.get(idea_id)


def list_reactions(idea_id: str, limit: int = 20) -> List[Reaction]:
    return list(_reactions.get(idea_id, []))[:limit]


def list_personas() -> List[Persona]:
    return sorted(_personas.values(), key=lambda item: item.updatedAt, reverse=True)


def create_idea(payload: IdeaCreate) -> Idea:
    ident = f"{IDEA_PREFIX}-{next(_idea_counter)}"
    now = _now_iso()
    ensure_project_exists(payload.projectId)
    idea = Idea(id=ident, createdAt=now, updatedAt=now, **payload.model_dump())
    _ideas[ident] = idea
    _reactions.setdefault(ident, [])
    log.info("Idea created id=%s", ident)
    return idea


def append_reaction(idea_id: str, reaction: Reaction) -> None:
    _reactions.setdefault(idea_id, []).append(reaction)


def create_reaction(idea_id: str, payload: Dict[str, Any]) -> Reaction:
    from app.schemas.idea import Reaction as ReactionSchema  # avoid circular

    reaction_id = f"{REACTION_PREFIX}-{next(_reaction_counter)}"
    reaction = ReactionSchema(
        id=reaction_id,
        ideaId=idea_id,
        createdAt=_now_iso(),
        **payload,
    )
    if getattr(reaction, "projectId", None):
        ensure_project_exists(reaction.projectId, fallback_name=reaction.projectId)
    append_reaction(idea_id, reaction)
    return reaction


def ensure_project_exists(project_id: str, fallback_name: Optional[str] = None) -> None:
    if project_id in _projects:
        return
    now = _now_iso()
    name = fallback_name or project_id
    _projects[project_id] = Project(id=project_id, name=name, createdAt=now, updatedAt=now)


def _slugify(value: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return base or f"project-{next(_project_counter)}"


def create_persona(payload: PersonaCreate) -> Persona:
    ident = f"persona-{next(_persona_counter)}"
    now = _now_iso()
    persona = Persona(
        id=ident,
        createdAt=now,
        updatedAt=now,
        **payload.model_dump(),
    )
    _personas[ident] = persona
    return persona
