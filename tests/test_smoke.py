from __future__ import annotations

from typing import Dict, Any

from fastapi.testclient import TestClient

from app.data.seed import seed
from app.main import create_app
from app.schemas.idea import SimulationRequest
from app.services import gpt_adapter, store


def _dummy_react(_: Any) -> Dict[str, Any]:
    return {
        "reaction": "テスト反応",
        "intent_to_try": 0.55,
        "price_acceptance": 0.48,
        "friction_hint": -0.1,
    }


def get_client() -> TestClient:
    store.reset_store()
    seed()
    app = create_app()
    client = TestClient(app)
    return client


def test_health_endpoint() -> None:
    client = get_client()
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_ideas_listing() -> None:
    client = get_client()
    response = client.get("/ideas")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3


def test_projects_endpoint() -> None:
    client = get_client()
    response = client.get("/projects")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3

    create_response = client.post("/projects", json={"name": "新規プロジェクト"})
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["name"] == "新規プロジェクト"


def test_score_endpoint() -> None:
    client = get_client()
    original = gpt_adapter.react
    gpt_adapter.react = _dummy_react  # type: ignore[assignment]
    try:
        response = client.post("/ideas/score", json={"ideaIds": ["idea-video-concierge"]})
        assert response.status_code == 200
        payload = response.json()[0]
        assert 0 <= payload["psf"] <= 100
        assert 0 <= payload["pmf"] <= 100
    finally:
        gpt_adapter.react = original  # type: ignore[assignment]


def test_simulation_endpoint() -> None:
    client = get_client()
    original = gpt_adapter.react
    gpt_adapter.react = _dummy_react  # type: ignore[assignment]
    try:
        response = client.post("/simulate", json={"ideaIds": ["idea-video-concierge", "idea-ai-reception"]})
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert 0 <= data[0]["winProb"] <= 1
    finally:
        gpt_adapter.react = original  # type: ignore[assignment]
