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
from typing import Any, Deque, Dict, Optional, Tuple

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

_cache: Dict[Tuple[str, ...], Dict[str, Any]] = {}
_cache_order: Deque[Tuple[str, ...]] = deque(maxlen=settings.reaction_cache_size)
_rate_window: Deque[float] = deque()


def _rate_limited() -> bool:
    now = time.time()
    while _rate_window and now - _rate_window[0] > 60:
        _rate_window.popleft()
    if len(_rate_window) >= settings.request_rate_limit_per_minute:
        return True
    _rate_window.append(now)
    return False


def _cache_get(key: Optional[Tuple[str, ...]]) -> Optional[Dict[str, Any]]:
    if key is None:
        return None
    payload = _cache.get(key)
    if payload:
        log.info("GPT cache hit key=%s", key)
    return payload


def _cache_set(key: Optional[Tuple[str, ...]], value: Dict[str, Any]) -> None:
    if key is None:
        return
    if key not in _cache:
        if len(_cache_order) >= _cache_order.maxlen:
            old_key = _cache_order.popleft()
            if old_key is not None:
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
def _chat_completion(
    *,
    system: str,
    user: str,
    temperature: float,
    max_tokens: int,
    response_format: Optional[Dict[str, str]] = None,
) -> str:
    if _rate_limited():
        raise RuntimeError("Rate limit exceeded for GPT calls.")

    request_payload: Dict[str, Any] = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format:
        request_payload["response_format"] = response_format

    response = client.chat.completions.create(**request_payload)
    log.info("OpenAI call cost estimation tokens=%s", response.usage)
    return response.choices[0].message.content or ""


def call_chat_json(
    *,
    system: str,
    user: str,
    fallback: Dict[str, Any],
    temperature: float = 0.4,
    max_tokens: int = 180,
    cache_key: Optional[Tuple[str, ...]] = None,
) -> Dict[str, Any]:
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    try:
        content = _chat_completion(
            system=system,
            user=user,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )
        payload = parse_or_default(content, fallback)
    except Exception as exc:  # noqa: BLE001
        log.warning("GPT JSON call failed, using fallback: %s", exc)
        payload = fallback.copy()

    payload["intent_to_try"] = float(
        max(0.0, min(1.0, payload.get("intent_to_try", fallback.get("intent_to_try", 0.5))))
    )
    payload["price_acceptance"] = float(
        max(0.0, min(1.0, payload.get("price_acceptance", fallback.get("price_acceptance", 0.5))))
    )
    if "friction_hint" in fallback:
        payload["friction_hint"] = float(
            max(-1.0, min(1.0, payload.get("friction_hint", fallback.get("friction_hint", 0.0))))
        )
    if not payload.get("reaction") and fallback.get("reaction"):
        payload["reaction"] = fallback["reaction"]

    _cache_set(cache_key, payload)
    return payload


def call_chat_text(
    *,
    system: str,
    user: str,
    fallback: str,
    temperature: float = 0.4,
    max_tokens: int = 200,
    cache_key: Optional[Tuple[str, ...]] = None,
) -> str:
    cached = _cache_get(cache_key)
    if cached is not None:
        return str(cached.get("text", fallback))

    try:
        content = _chat_completion(
            system=system,
            user=user,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        text = content.strip() if content else fallback
    except Exception as exc:  # noqa: BLE001
        log.warning("GPT text call failed, using fallback: %s", exc)
        text = fallback

    _cache_set(cache_key, {"text": text})
    return text


def react(idea: Idea) -> Dict[str, Any]:
    prompt = _build_prompt(idea)
    cache_key = (idea.id, idea.updatedAt)
    return call_chat_json(
        system=SYSTEM,
        user=prompt,
        fallback=DEFAULT_PAYLOAD.copy(),
        temperature=0.4,
        max_tokens=180,
        cache_key=cache_key,
    )
