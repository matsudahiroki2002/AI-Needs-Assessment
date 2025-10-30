"""
HTTP endpoints for managing persona registrations.
"""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, status

from app.schemas.persona import Persona, PersonaCreate
from app.services import store

router = APIRouter(prefix="/personas", tags=["Personas"])


@router.get("/", response_model=List[Persona])
def list_personas() -> List[Persona]:
    return store.list_personas()


@router.post("/", response_model=Persona, status_code=status.HTTP_201_CREATED)
def create_persona(payload: PersonaCreate) -> Persona:
    return store.create_persona(payload)
