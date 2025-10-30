"""
Simulation helpers that orchestrate persona-specific GPT reactions and aggregate insights.
"""
from __future__ import annotations

import logging
import math
from statistics import mean
from typing import Iterable, List, Sequence

from app.schemas.common import CI
from app.schemas.idea import (
    Idea,
    SimulationPersonaReaction,
    SimulationRequest,
    SimulationResult,
)
from app.schemas.persona import Persona
from app.services import gpt_adapter, statkit, store

log = logging.getLogger(__name__)

PERSONA_SYSTEM = "あなたは市場リサーチAI。出力は厳密なJSONのみ。余計な説明は不要です。"
SUMMARY_SYSTEM = "あなたはUXリサーチャーです。コメントを要約し、洞察を簡潔に示してください。"
SUMMARY_PROMPT_TMPL = """以下のコメントから共通する洞察と気付きを150文字以内の日本語でまとめてください:
{comments}
"""

DEFAULT_PERSONA_RESPONSE = {
    "comment": "まだ判断できませんが、まずは小さく試してみたいです。",
    "intent_to_try": 0.5,
    "price_acceptance": 0.5,
}
DEFAULT_SUMMARY = "コメントが少なく、十分なサマリを生成できませんでした。"


def _idea_to_text(idea: Idea) -> str:
    return (
        f"タイトル: {idea.title}\n"
        f"ターゲット: {idea.target}\n"
        f"課題: {idea.pain}\n"
        f"解決策: {idea.solution}\n"
        f"価格: {idea.price}円\n"
        f"導入ステップ: {idea.onboarding}"
    )


def build_prompt(idea_text: str, persona: Persona) -> str:
    trait_text = "特性情報なし"
    if persona.traits:
        trait_pairs = [f"{key}={round(value, 2)}" for key, value in persona.traits.items()]
        trait_text = ", ".join(trait_pairs)

    background = persona.background or "経歴情報なし"
    comment_style = persona.comment_style or "自由な語り口"

    return (
        f"あなたは {persona.category} です。\n"
        f"会話スタイル: {comment_style}\n"
        f"特徴パラメータ: {trait_text}\n"
        f"経歴: {background}\n\n"
        "これから、次のアイデアについて、あなたの立場から意見を述べてください。\n"
        f"アイデア内容:\n{idea_text}\n\n"
        "出力フォーマットは以下のJSON形式で返してください:\n"
        "{\n"
        '  "comment": "自由記述コメント",\n'
        '  "intent_to_try": 0.0,\n'
        '  "price_acceptance": 0.0\n'
        "}\n"
    )


def _clamp(value: float, lo: float, hi: float) -> float:
    return statkit.bounded(value, lo, hi)


def _persona_reaction(idea: Idea, persona: Persona) -> SimulationPersonaReaction:
    prompt = build_prompt(_idea_to_text(idea), persona)
    cache_key = ("persona-reaction", idea.id, idea.updatedAt, persona.id)
    payload = gpt_adapter.call_chat_json(
        system=PERSONA_SYSTEM,
        user=prompt,
        fallback=DEFAULT_PERSONA_RESPONSE.copy(),
        temperature=0.5,
        max_tokens=220,
        cache_key=cache_key,
    )

    comment = str(payload.get("comment", DEFAULT_PERSONA_RESPONSE["comment"])).strip()
    intent = _clamp(float(payload.get("intent_to_try", 0.5)), 0.0, 1.0)
    price = _clamp(float(payload.get("price_acceptance", 0.5)), 0.0, 1.0)

    return SimulationPersonaReaction(
        personaId=persona.id,
        personaName=persona.name,
        category=persona.category,
        comment=comment or DEFAULT_PERSONA_RESPONSE["comment"],
        intent_to_try=round(intent, 4),
        price_acceptance=round(price, 4),
    )


def _mean(values: Sequence[float], default: float = 0.0) -> float:
    return mean(values) if values else default


def _ci95(values: Sequence[float]) -> CI:
    if not values:
        return CI(low=0.0, high=0.0)

    mu = _mean(values)
    if len(values) == 1:
        bounded_low = statkit.bounded(mu, 0.0, 1.0)
        bounded_high = statkit.bounded(mu, 0.0, 1.0)
        return CI(low=round(bounded_low * 100, 1), high=round(bounded_high * 100, 1))

    variance = _mean([(value - mu) ** 2 for value in values])
    std_dev = math.sqrt(variance)
    margin = 1.96 * (std_dev / math.sqrt(len(values)))
    low = statkit.bounded(mu - margin, 0.0, 1.0)
    high = statkit.bounded(mu + margin, 0.0, 1.0)
    return CI(low=round(low * 100, 1), high=round(high * 100, 1))


def summarize_comments(idea: Idea, comments: Iterable[str]) -> str:
    filtered = [comment.strip() for comment in comments if comment and comment.strip()]
    if not filtered:
        return DEFAULT_SUMMARY

    bullet_lines = "\n".join(f"- {line}" for line in filtered[:10])
    prompt = SUMMARY_PROMPT_TMPL.format(comments=bullet_lines)
    cache_key = (
        "persona-summary",
        idea.id,
        idea.updatedAt,
        str(hash(tuple(filtered))),
    )
    return gpt_adapter.call_chat_text(
        system=SUMMARY_SYSTEM,
        user=prompt,
        fallback=DEFAULT_SUMMARY,
        temperature=0.4,
        max_tokens=180,
        cache_key=cache_key,
    )


def _simulate_for_idea(idea: Idea, personas: List[Persona]) -> SimulationResult:
    reactions = [_persona_reaction(idea, persona) for persona in personas]

    intents = [reaction.intent_to_try for reaction in reactions]
    prices = [reaction.price_acceptance for reaction in reactions]
    psf = round(_mean(intents) * 100, 1)
    pmf = round(_mean(prices) * 100, 1)
    ci95 = _ci95(prices)
    summary_comment = summarize_comments(idea, (reaction.comment for reaction in reactions))

    return SimulationResult(
        ideaId=idea.id,
        ideaTitle=idea.title,
        projectId=idea.projectId,
        version=idea.version,
        psf=psf,
        pmf=pmf,
        ci95=ci95,
        personaReactions=reactions,
        summaryComment=summary_comment,
    )


def simulate(request: SimulationRequest) -> List[SimulationResult]:
    idea_ids = request.ideaIds
    ideas: List[Idea] = [
        idea for idea_id in idea_ids if (idea := store.get_idea(idea_id)) is not None
    ]
    if not ideas:
        return []

    personas = store.list_personas()
    if not personas:
        log.warning("No personas registered; simulation cannot run.")
        return []

    return [_simulate_for_idea(idea, personas) for idea in ideas]
