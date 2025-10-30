"""
Synthetic statistical utilities powering the mock backend responses.

The heuristics implemented here are intentionally simple so that they can be
swapped out for real analytics pipelines later on.
"""
from __future__ import annotations

import math
import random
from typing import Dict, Iterable, List, Sequence, Tuple

import numpy as np

from app.schemas.common import Contribution, ContributionFactor, Score
from app.schemas.idea import SimulationResult, SimulationRanges

RANGE_DECIMALS = 2
FACTOR_LABELS = ["Pain適合", "TTFV", "価格", "摩擦", "信頼"]

_rng = np.random.default_rng()


def seed_all(seed: int | None) -> None:
    """Synchronise Python and NumPy RNGs for deterministic tests."""
    if seed is None:
        return
    random.seed(seed)
    np.random.seed(seed)


def bounded(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def range_tuple(lo: float, hi: float, decimals: int = RANGE_DECIMALS) -> Tuple[float, float]:
    clipped_lo = bounded(lo, 0.0, 1.0)
    clipped_hi = bounded(hi, 0.0, 1.0)
    return (round(clipped_lo, decimals), round(clipped_hi, decimals))


def _random_trend() -> float:
    return float(_rng.uniform(0.4, 0.7))


def _random_ci_window() -> float:
    return float(_rng.uniform(6.0, 10.0))


def _verdict(pmf: float, psf: float) -> str:
    avg = 0.6 * pmf + 0.4 * psf
    if avg >= 70:
        return "Go"
    if avg >= 50:
        return "Improve"
    return "Kill"


def _contribution_values() -> List[ContributionFactor]:
    raw = _rng.normal(0.2, 0.08, size=len(FACTOR_LABELS))
    abs_total = float(np.sum(np.abs(raw))) or 1.0
    factors = []
    for label, value in zip(FACTOR_LABELS, raw, strict=False):
        factors.append(ContributionFactor(name=label, value=float(round(value / abs_total, 3))))
    return factors


def compute_score(
    idea_id: str,
    insight: Dict[str, float],
    project_id: str | None = None,
    version: str | None = None,
) -> Tuple[Score, Contribution]:
    """
    Generate a synthetic Score and Contribution for the provided insight payload.

    insight keys: intent_to_try, price_acceptance, friction_hint, trend?, cred?
    """
    intent = bounded(float(insight.get("intent_to_try", 0.5)), 0.0, 1.0)
    price_acc = bounded(float(insight.get("price_acceptance", 0.5)), 0.0, 1.0)
    friction = bounded(float(insight.get("friction_hint", 0.0)), -1.0, 1.0)

    trend = insight.get("trend")
    if trend is None:
        trend = _random_trend()
    cred = insight.get("credibility")
    if cred is None:
        cred = _random_trend()

    psf = 100.0 * (
        0.5 * intent
        + 0.3 * price_acc
        + 0.2 * (1.0 - max(friction, 0.0))
    )
    pmf = 100.0 * (
        0.45 * intent
        + 0.25 * price_acc
        + 0.15 * trend
        + 0.15 * cred
    )

    psf = bounded(psf, 0.0, 100.0)
    pmf = bounded(pmf, 0.0, 100.0)

    delta = _random_ci_window()
    ci_low = bounded(pmf - delta, 0.0, 100.0)
    ci_high = bounded(pmf + delta, 0.0, 100.0)

    score = Score(
        ideaId=idea_id,
        projectId=project_id,
        version=version,
        psf=round(psf, 1),
        pmf=round(pmf, 1),
        ci95={"low": round(ci_low, 1), "high": round(ci_high, 1)},  # type: ignore[arg-type]
        p_apply=range_tuple(intent * 0.6, intent * 0.9),
        p_purchase=range_tuple(intent * 0.3, intent * 0.6),
        p_d7=range_tuple(intent * 0.4, intent * 0.75),
        verdict=_verdict(pmf, psf),
    )

    contribution = Contribution(
        ideaId=idea_id,
        projectId=project_id,
        version=version,
        factors=_contribution_values(),
    )
    return score, contribution


def simulate_win_probs(idea_ids: Sequence[str]) -> Dict[str, float]:
    samples = _rng.random(len(idea_ids))
    total = float(np.sum(samples)) or 1.0
    return {idea_id: float(round(val / total, 3)) for idea_id, val in zip(idea_ids, samples, strict=False)}


def build_simulation_result(idea_id: str, momentum: Dict[str, float]) -> SimulationResult:
    intent = bounded(momentum.get("intent_to_try", 0.5), 0.0, 1.0)
    score, _ = compute_score(idea_id, momentum)
    ranges = SimulationRanges(
        p_apply=score.p_apply,
        p_purchase=score.p_purchase,
        p_d7=score.p_d7,
    )
    return SimulationResult(
        ideaId=idea_id,
        winProb=bounded(momentum.get("win_prob", 0.33), 0.0, 1.0),
        ranges=ranges,
        ci95=score.ci95,
        summary="想定セグメントでの勝率推定です。補助施策で体験導線を強化してください。",
    )
