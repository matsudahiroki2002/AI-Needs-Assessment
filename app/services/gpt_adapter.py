"""
Thin wrapper around the OpenAI SDK to generate synthetic user reactions.

This module intentionally encapsulates all vendor-specific logic so future
model migrations only require changes here.
"""
from __future__ import annotations

import json
import logging
import os
import time
from collections import deque
from typing import Any, Deque, Dict, Tuple

from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.schemas.idea import Idea
from app.utils.json_safety import parse_or_default

log = logging.getLogger(__name__)

settings = get_settings()
client = OpenAI()
MODEL = os.getenv("MODEL_CHAT", settings.model_chat)

SYSTEM = "あなたは市場リサーチAI。出力は厳密なJSONのみ。コメントや説明を一切含めない。"
USER_TMPL = """以下の案に対する想定反応をJSONで出力してください。
- ターゲット: {target}
- 課題: {pain}
- 解決: {solution}
- 価格: {price}円
- 導入: {onboarding}

JSONスキーマ:
{{
  "reaction": "短い一言",
  "intent_to_try": 0.00,
  "price_acceptance": 0.00,
  "friction_hint": 0.00
}}
"""

DEFAULT_PAYLOAD: Dict[str, Any] = {
    "reaction": "便利そうだが価格が気になる",
    "intent_to_try": 0.42,
    "price_acceptance": 0.5,
    "friction_hint": 0.0,
}

_cache: Dict[Tuple[str, str], Dict[str, Any]] = {}
_cache_order: Deque[Tuple[str, str]] = deque(maxlen=settings.reaction_cache_size)
_rate_window: Deque[float] = deque()


def _rate_limited() -> bool:
    now = time.time()
    while _rate_window and now - _rate_window[0] > 60:
        _rate_window.popleft()
    if len(_rate_window) >= settings.request_rate_limit_per_minute:
        return True
    _rate_window.append(now)
    return False


def _cache_get(key: Tuple[str, str]) -> Dict[str, Any] | None:
    payload = _cache.get(key)
    if payload:
        log.info("GPT cache hit idea=%s", key[0])
    return payload


def _cache_set(key: Tuple[str, str], value: Dict[str, Any]) -> None:
    if key not in _cache:
        if len(_cache_order) >= _cache_order.maxlen:
            old_key = _cache_order.popleft()
            _cache.pop(old_key, None)
        _cache_order.append(key)
    _cache[key] = value


def _build_prompt(idea: Idea) -> str:
    return USER_TMPL.format(
        target=idea.target,
        pain=idea.pain,
        solution=idea.solution,
        price=idea.price,
        onboarding=idea.onboarding,
    )


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.6, max=4))
def _call_openai(message: str) -> Dict[str, Any]:
    if _rate_limited():
        raise RuntimeError("Rate limit exceeded for GPT calls.")
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": message},
        ],
        temperature=0.4,
        max_tokens=180,
        response_format={"type": "json_object"},
    )
    content = response.choices[0].message.content or ""
    payload = parse_or_default(content, DEFAULT_PAYLOAD)
    payload["intent_to_try"] = float(max(0.0, min(1.0, payload.get("intent_to_try", DEFAULT_PAYLOAD["intent_to_try"]))))
    payload["price_acceptance"] = float(max(0.0, min(1.0, payload.get("price_acceptance", DEFAULT_PAYLOAD["price_acceptance"]))))
    payload["friction_hint"] = float(max(-1.0, min(1.0, payload.get("friction_hint", DEFAULT_PAYLOAD["friction_hint"]))))
    if not payload.get("reaction"):
        payload["reaction"] = DEFAULT_PAYLOAD["reaction"]
    log.info("OpenAI call cost estimation tokens=%s", response.usage)
    return payload


def react(idea: Idea) -> Dict[str, Any]:
    cache_key = (idea.id, idea.updatedAt)
    cached = _cache_get(cache_key)
    if cached:
        return cached

    prompt = _build_prompt(idea)
    try:
        payload = _call_openai(prompt)
    except Exception as exc:  # noqa: BLE001
        log.warning("GPT call failed, using default payload: %s", exc)
        payload = DEFAULT_PAYLOAD.copy()

    _cache_set(cache_key, payload)
    return payload
