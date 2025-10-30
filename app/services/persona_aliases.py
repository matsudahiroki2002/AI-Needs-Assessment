"""Utility helpers for bridging legacy agent IDs to persona identifiers."""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterator, Optional

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class PersonaAlias:
    persona_id: str
    legacy_agent_id: str
    slug: Optional[str] = None
    display_name: Optional[str] = None
    category: Optional[str] = None
    segment: Optional[str] = None


_ALIAS_BY_LEGACY: Dict[str, PersonaAlias] = {}
_ALIAS_BY_PERSONA: Dict[str, PersonaAlias] = {}


def _load_aliases() -> None:
    if _ALIAS_BY_LEGACY:
        return

    root = Path(__file__).resolve().parents[2]
    path = root / "shared" / "persona-aliases.json"
    if not path.exists():
        log.warning("Persona alias mapping file not found at %s", path)
        return

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:  # pragma: no cover - configuration error
        log.error("Failed to parse persona alias mapping: %s", exc)
        return

    for entry in raw:
        try:
            alias = PersonaAlias(
                persona_id=entry["personaId"],
                legacy_agent_id=entry["legacyAgentId"],
                slug=entry.get("slug"),
                display_name=entry.get("displayName"),
                category=entry.get("category"),
                segment=entry.get("segment"),
            )
        except KeyError as exc:  # pragma: no cover - configuration error
            log.error("Invalid persona alias entry missing %s: %s", exc, entry)
            continue
        _ALIAS_BY_LEGACY[alias.legacy_agent_id] = alias
        _ALIAS_BY_PERSONA.setdefault(alias.persona_id, alias)


def iter_aliases() -> Iterator[PersonaAlias]:
    _load_aliases()
    return iter(_ALIAS_BY_PERSONA.values())


@dataclass
class PersonaResolution:
    persona_id: Optional[str]
    alias: Optional[PersonaAlias]
    used_legacy: bool
    unresolved_legacy: Optional[str] = None


def resolve_persona_reference(
    *, persona_id: Optional[str] = None, legacy_agent_id: Optional[str] = None
) -> PersonaResolution:
    """Resolve persona identifiers, logging when legacy agent IDs are used."""
    _load_aliases()

    alias: Optional[PersonaAlias] = None
    if persona_id:
        alias = _ALIAS_BY_PERSONA.get(persona_id)

    used_legacy = False
    unresolved: Optional[str] = None

    if not persona_id and legacy_agent_id:
        alias = _ALIAS_BY_LEGACY.get(legacy_agent_id)
        used_legacy = True
        if alias:
            log.warning(
                "Deprecated agentId '%s' received; mapped to personaId '%s'",
                legacy_agent_id,
                alias.persona_id,
            )
            persona_id = alias.persona_id
        else:
            log.error(
                "Legacy agentId '%s' could not be resolved to a personaId", legacy_agent_id
            )
            unresolved = legacy_agent_id

    return PersonaResolution(
        persona_id=persona_id,
        alias=alias,
        used_legacy=used_legacy,
        unresolved_legacy=unresolved,
    )
