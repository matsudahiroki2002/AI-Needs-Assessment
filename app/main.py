"""
Entrypoint for the FastAPI application.
"""
from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings
from app.data.seed import seed
from app.services import store

log = logging.getLogger(__name__)

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def _startup() -> None:  # pragma: no cover - side effect
        seed()
        log.info("Application started with %d seeded ideas", len(store.list_ideas()))

    app.include_router(router)
    return app


app = create_app()
