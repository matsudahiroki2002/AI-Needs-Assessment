"""
Initial data population for development and automated tests.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List

from app.schemas.idea import Idea, Reaction
from app.schemas.persona import Persona
from app.schemas.project import Project
from app.services import store

log = logging.getLogger(__name__)


def _ts() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def seed() -> None:
    if store.list_projects():
        # assume already seeded
        return

    now = _ts()

    projects: List[Project] = [
      Project(id="projectA", name="プロジェクトA", createdAt=now, updatedAt=now),
      Project(id="projectB", name="プロジェクトB", createdAt=now, updatedAt=now),
      Project(id="projectC", name="プロジェクトC", createdAt=now, updatedAt=now),
    ]
    store.upsert_projects(projects)

    ideas: List[Idea] = [
        Idea(
            id="idea-video-concierge",
            projectId="projectA",
            version="A",
            title="AI動画編集コンシェルジュ",
            target="学生 / クリエイター志望",
            pain="動画編集の手戻りが多く締切に追われている。",
            solution="素材アップロードでAIが粗編集し、構成案も提示する。",
            price=4980,
            channel="SNS広告",
            onboarding="LINE連携→素材アップロード→AIラフ→フィードバック→納品。",
            createdAt=_ts(),
            updatedAt=_ts(),
        ),
        Idea(
            id="idea-ai-reception",
            projectId="projectB",
            version="A",
            title="AI接客コーチ",
            target="小売 / 接客スタッフ",
            pain="新人育成に時間がかかり接客品質が安定しない。",
            solution="ロールプレイとフィードバックをAIが自動生成。",
            price=6980,
            channel="店舗向けメルマガ",
            onboarding="管理者登録→スタッフ招待→初回ロールプレイ→改善レポート。",
            createdAt=_ts(),
            updatedAt=_ts(),
        ),
        Idea(
            id="idea-english-routine",
            projectId="projectC",
            version="A",
            title="ながら英語ルーティン",
            target="社会人 / 海外営業",
            pain="継続的な学習時間を確保できない。",
            solution="隙間時間で音声レッスンとダッシュボードが進捗を可視化。",
            price=3980,
            channel="ウェビナー連携",
            onboarding="Slack連携→目標設定→AIの週間プラン→月次レポート。",
            createdAt=_ts(),
            updatedAt=_ts(),
        ),
    ]

    store.upsert_ideas(ideas)

    personas: List[Persona] = [
        Persona(
            id="persona-startup-lead-01",
            name="坂本 海斗",
            category="スタートアップ決裁者",
            age=32,
            gender="男性",
            background="SaaSスタートアップ COO。営業とカスタマーサクセスを統括し、ROIと実装コストのバランスに敏感。",
            traits={
                "novelty": 0.7,
                "price_sensitivity": 0.4,
                "social_dependence": 0.5,
                "brand_loyalty": 0.3,
            },
            comment_style="冷静分析型",
            createdAt=_ts(),
            updatedAt=_ts(),
        ),
        Persona(
            id="persona-student-01",
            name="村上 彩音",
            category="学生",
            age=21,
            gender="女性",
            background="映像専門学校3年。卒業制作でSNS向け短尺動画を制作している。",
            traits={
                "novelty": 0.82,
                "price_sensitivity": 0.68,
                "social_dependence": 0.76,
                "brand_loyalty": 0.42,
            },
            comment_style="フレンドリー",
            createdAt=_ts(),
            updatedAt=_ts(),
        ),
    ]

    store.upsert_personas(personas)

    base_reactions = [
        Reaction(
            id="reaction-001",
            ideaId="idea-video-concierge",
            projectId="projectA",
            version="A",
            personaId="persona-student-01",
            text="卒業制作が迫っているのでAIが粗編集してくれるのは助かる。",
            likelihood=0.62,
            intent_to_try=0.58,
            createdAt=_ts(),
            segment="学生 / クリエイター志望",
        ),
        Reaction(
            id="reaction-002",
            ideaId="idea-ai-reception",
            projectId="projectB",
            version="A",
            personaId="persona-startup-lead-01",
            text="新人研修の時間が半分になりそう。料金は許容できる。",
            likelihood=0.7,
            intent_to_try=0.68,
            createdAt=_ts(),
            segment="小売 / 接客リーダー",
        ),
        Reaction(
            id="reaction-003",
            ideaId="idea-english-routine",
            projectId="projectC",
            version="A",
            personaId="persona-startup-lead-01",
            text="移動中に学べるのは助かるが、成果の可視化がどれほどか気になる。",
            likelihood=0.55,
            intent_to_try=0.5,
            createdAt=_ts(),
            segment="社会人 / 海外営業",
        ),
    ]

    for reaction in base_reactions:
        store.append_reaction(reaction.ideaId, reaction)

    log.info("Seed data initialised with %d projects and %d ideas.", len(projects), len(ideas))
