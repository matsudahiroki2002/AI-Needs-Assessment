"""
Simulation helpers that orchestrate GPT insights with statistical heuristics.
"""
from __future__ import annotations

import logging
from typing import List

from app.schemas.idea import SimulationRequest, SimulationResult, SimulationRanges
from app.services import gpt_adapter, statkit, store

log = logging.getLogger(__name__)


def simulate(request: SimulationRequest) -> List[SimulationResult]:
    idea_ids = request.ideaIds
    available = [store.get_idea(idea_id) for idea_id in idea_ids]
    ideas = [idea for idea in available if idea is not None]
    if not ideas:
        return []

    wins = statkit.simulate_win_probs([idea.id for idea in ideas])
    results: List[SimulationResult] = []

    for idea in ideas:
        insight = gpt_adapter.react(idea)
        score, _ = statkit.compute_score(idea.id, insight, idea.projectId, idea.version)
        result = SimulationResult(
            ideaId=idea.id,
            projectId=idea.projectId,
            version=idea.version,
            winProb=wins.get(idea.id, 0.0),
            ranges=SimulationRanges(
                p_apply=score.p_apply,
                p_purchase=score.p_purchase,
                p_d7=score.p_d7,
            ),
            ci95=score.ci95,
            summary="仮想セグメントでの勝率推定です。補助施策で体験導線を強化してください。",
        )
        results.append(result)

    return results
