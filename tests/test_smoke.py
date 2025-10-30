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


def test_personas_endpoint() -> None:
    client = get_client()
    response = client.get("/personas")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

    payload = {
        "name": "テスト 太郎",
        "category": "スタートアップ決裁者",
        "age": 34,
        "gender": "男性",
        "background": "SaaSのプロダクトマネージャー。",
        "traits": {
            "novelty": 0.6,
            "price_sensitivity": 0.45,
        },
        "comment_style": "現実的",
    }
    create_response = client.post("/personas", json=payload)
    assert create_response.status_code == 201
    persona = create_response.json()
    assert persona["name"] == payload["name"]
    assert persona["category"] == payload["category"]


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
    original_react = gpt_adapter.react
    original_json = gpt_adapter.call_chat_json
    original_text = gpt_adapter.call_chat_text

    def _fake_call_chat_json(*args: Any, **kwargs: Any) -> Dict[str, Any]:
        return {
            "comment": "テストコメント",
            "intent_to_try": 0.64,
            "price_acceptance": 0.58,
        }

    def _fake_call_chat_text(*args: Any, **kwargs: Any) -> str:
        return "学生層からは高評価、コスト面の配慮が必要です。"

    gpt_adapter.react = _dummy_react  # type: ignore[assignment]
    gpt_adapter.call_chat_json = _fake_call_chat_json  # type: ignore[assignment]
    gpt_adapter.call_chat_text = _fake_call_chat_text  # type: ignore[assignment]
    try:
        response = client.post("/simulate", json={"ideaIds": ["idea-video-concierge", "idea-ai-reception"]})
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        first = data[0]
        assert "psf" in first and 0 <= first["psf"] <= 100
        assert "pmf" in first and 0 <= first["pmf"] <= 100
        assert len(first["personaReactions"]) >= 1
        assert "summaryComment" in first
    finally:
        gpt_adapter.react = original_react  # type: ignore[assignment]
        gpt_adapter.call_chat_json = original_json  # type: ignore[assignment]
        gpt_adapter.call_chat_text = original_text  # type: ignore[assignment]
