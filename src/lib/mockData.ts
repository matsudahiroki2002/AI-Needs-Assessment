/**
 * @file Mock dataset powering the UI-only MVP for the Needs Research App.
 * @remarks Dataset supports multiple projects and idea versions so the UI can toggle contexts.
 */
import { Contribution, Idea, Persona, Project, RagDoc, Reaction, Score } from "./types";

export const projects: Project[] = [
  {
    id: "projectA",
    name: "プロジェクトA",
    createdAt: "2024-05-01T09:00:00.000Z",
    updatedAt: "2024-05-28T15:00:00.000Z"
  },
  {
    id: "projectB",
    name: "プロジェクトB",
    createdAt: "2024-04-12T10:00:00.000Z",
    updatedAt: "2024-05-27T12:00:00.000Z"
  },
  {
    id: "projectC",
    name: "プロジェクトC",
    createdAt: "2024-03-20T08:00:00.000Z",
    updatedAt: "2024-05-25T18:00:00.000Z"
  }
];

const ts = (month: number, day: number) => `2024-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T09:00:00.000Z`;

export const ideas: Idea[] = [
  {
    id: "idea-video-concierge-a",
    projectId: "projectA",
    version: "A",
    title: "AI動画編集コンシェルジュ",
    target: "学生 / クリエイター志望",
    pain: "動画編集の手戻りが多く締切に追われている",
    solution: "素材アップロードでAIが粗編集と構成案を提示する学習スタジオ",
    price: 4980,
    channel: "SNS広告",
    onboarding: "LINE連携→素材アップロード→AIラフ→フィードバック→納品",
    createdAt: ts(5, 1),
    updatedAt: ts(5, 28)
  },
  {
    id: "idea-video-concierge-b",
    projectId: "projectA",
    version: "B",
    title: "AI動画編集コンシェルジュ",
    target: "学生 / クリエイター志望",
    pain: "動画編集に割ける時間が少なく品質が安定しない",
    solution: "テンプレート×AIコーチで30分以内に粗編が完了するフロー",
    price: 5480,
    channel: "共同SNSキャンペーン",
    onboarding: "Googleログイン→素材保存→コメント指示→書き出し",
    createdAt: ts(5, 2),
    updatedAt: ts(5, 29)
  },
  {
    id: "idea-ai-reception-a",
    projectId: "projectB",
    version: "A",
    title: "AI接客コーチ",
    target: "小売 / 接客スタッフ",
    pain: "新人教育に時間が割けず接客品質が安定しない",
    solution: "ロールプレイ台本とフィードバックをAIが生成するトレーニング",
    price: 6980,
    channel: "店舗向けメルマガ",
    onboarding: "管理者登録→スタッフ招待→初回ロールプレイ→改善レポート",
    createdAt: ts(4, 12),
    updatedAt: ts(5, 27)
  },
  {
    id: "idea-ai-reception-b",
    projectId: "projectB",
    version: "B",
    title: "AI接客コーチ",
    target: "小売 / 接客スタッフ",
    pain: "ピークタイムの応対スクリプトが共有されていない",
    solution: "POS連携で売れ筋に応じた接客トークをAIが提案",
    price: 7480,
    channel: "店舗内タブレット",
    onboarding: "POS連携→サンプルロールプレイ→部署共有",
    createdAt: ts(4, 18),
    updatedAt: ts(5, 26)
  },
  {
    id: "idea-english-routine-a",
    projectId: "projectC",
    version: "A",
    title: "ながら英語ルーティン",
    target: "社会人 / 海外営業",
    pain: "継続的な学習時間を確保できない",
    solution: "通勤の隙間時間で音声レッスンと進捗可視化を提供",
    price: 3980,
    channel: "ウェビナー連携",
    onboarding: "Slack連携→目標設定→AI週間プラン→月次レポート",
    createdAt: ts(3, 20),
    updatedAt: ts(5, 25)
  },
  {
    id: "idea-english-routine-b",
    projectId: "projectC",
    version: "B",
    title: "ながら英語ルーティン",
    target: "社会人 / 海外営業",
    pain: "スピーキング練習の相手が確保できない",
    solution: "AIが対話相手となり営業シナリオを即興で返すモード",
    price: 4280,
    channel: "社内ポータル",
    onboarding: "Teamsログイン→英語レベル診断→毎朝10分スロット",
    createdAt: ts(3, 25),
    updatedAt: ts(5, 24)
  }
];

export const scores: Score[] = [
  {
    ideaId: "idea-video-concierge-a",
    projectId: "projectA",
    version: "A",
    psf: 74,
    pmf: 68,
    ci95: { low: 61, high: 79 },
    p_apply: [0.4, 0.56],
    p_purchase: [0.23, 0.35],
    p_d7: [0.45, 0.6],
    verdict: "Improve"
  },
  {
    ideaId: "idea-video-concierge-b",
    projectId: "projectA",
    version: "B",
    psf: 70,
    pmf: 62,
    ci95: { low: 58, high: 74 },
    p_apply: [0.36, 0.5],
    p_purchase: [0.2, 0.31],
    p_d7: [0.42, 0.55],
    verdict: "Improve"
  },
  {
    ideaId: "idea-ai-reception-a",
    projectId: "projectB",
    version: "A",
    psf: 82,
    pmf: 75,
    ci95: { low: 68, high: 86 },
    p_apply: [0.49, 0.62],
    p_purchase: [0.36, 0.48],
    p_d7: [0.52, 0.64],
    verdict: "Go"
  },
  {
    ideaId: "idea-ai-reception-b",
    projectId: "projectB",
    version: "B",
    psf: 79,
    pmf: 71,
    ci95: { low: 63, high: 82 },
    p_apply: [0.46, 0.59],
    p_purchase: [0.32, 0.44],
    p_d7: [0.49, 0.61],
    verdict: "Go"
  },
  {
    ideaId: "idea-english-routine-a",
    projectId: "projectC",
    version: "A",
    psf: 60,
    pmf: 55,
    ci95: { low: 47, high: 64 },
    p_apply: [0.3, 0.44],
    p_purchase: [0.19, 0.3],
    p_d7: [0.35, 0.48],
    verdict: "Improve"
  },
  {
    ideaId: "idea-english-routine-b",
    projectId: "projectC",
    version: "B",
    psf: 65,
    pmf: 58,
    ci95: { low: 50, high: 66 },
    p_apply: [0.33, 0.47],
    p_purchase: [0.2, 0.33],
    p_d7: [0.37, 0.5],
    verdict: "Improve"
  }
];

export const contributions: Contribution[] = [
  {
    ideaId: "idea-video-concierge-a",
    projectId: "projectA",
    version: "A",
    factors: [
      { name: "納期短縮効果", value: 0.28 },
      { name: "動画品質の安定", value: 0.24 },
      { name: "AIテンプレ活用", value: 0.18 },
      { name: "価格妥当性", value: 0.16 },
      { name: "サポート期待", value: 0.14 }
    ]
  },
  {
    ideaId: "idea-video-concierge-b",
    projectId: "projectA",
    version: "B",
    factors: [
      { name: "納期短縮効果", value: 0.26 },
      { name: "個別フィードバック", value: 0.21 },
      { name: "価格妥当性", value: 0.18 },
      { name: "テンプレ多様性", value: 0.17 },
      { name: "導入摩擦", value: -0.1 }
    ]
  },
  {
    ideaId: "idea-ai-reception-a",
    projectId: "projectB",
    version: "A",
    factors: [
      { name: "リアルログ再現", value: 0.31 },
      { name: "即時フィードバック", value: 0.26 },
      { name: "導入スピード", value: 0.19 },
      { name: "管理ダッシュボード", value: 0.15 },
      { name: "既存システム連携", value: 0.09 }
    ]
  },
  {
    ideaId: "idea-ai-reception-b",
    projectId: "projectB",
    version: "B",
    factors: [
      { name: "POS連携価値", value: 0.29 },
      { name: "即時フィードバック", value: 0.24 },
      { name: "教育コスト削減", value: 0.2 },
      { name: "摩擦", value: -0.1 },
      { name: "信頼性", value: 0.17 }
    ]
  },
  {
    ideaId: "idea-english-routine-a",
    projectId: "projectC",
    version: "A",
    factors: [
      { name: "習慣化サポート", value: 0.22 },
      { name: "隙間時間活用", value: 0.2 },
      { name: "学習可視化", value: 0.17 },
      { name: "モバイル対応", value: 0.14 },
      { name: "価格耐性", value: 0.12 }
    ]
  },
  {
    ideaId: "idea-english-routine-b",
    projectId: "projectC",
    version: "B",
    factors: [
      { name: "対話リアリティ", value: 0.24 },
      { name: "習慣化サポート", value: 0.21 },
      { name: "価格耐性", value: 0.15 },
      { name: "摩擦", value: -0.08 },
      { name: "信頼", value: 0.12 }
    ]
  }
];

export const personas: Persona[] = [
  {
    agent_id: "agent-001",
    projectId: "projectA",
    segment: "学生 / クリエイター志望",
    traits: { novelty: 0.82, price_sensitivity: 0.46, time_constraint: 0.73 },
    constraints: { budget: 6000, time: 5 },
    social: { degree: 0.68, community: "映像研究サークル" }
  },
  {
    agent_id: "agent-102",
    projectId: "projectB",
    segment: "小売 / 接客リーダー",
    traits: { novelty: 0.54, price_sensitivity: 0.32, time_constraint: 0.61 },
    constraints: { budget: 12000, time: 3 },
    social: { degree: 0.55, community: "地域商店会" }
  },
  {
    agent_id: "agent-203",
    projectId: "projectC",
    segment: "社会人 / 海外営業",
    traits: { novelty: 0.44, price_sensitivity: 0.58, time_constraint: 0.81 },
    constraints: { budget: 8000, time: 2 },
    social: { degree: 0.63, community: "外資営業コミュニティ" }
  },
  {
    agent_id: "agent-304",
    projectId: "projectA",
    segment: "学生 / クリエイター志望",
    traits: { novelty: 0.76, price_sensitivity: 0.51, time_constraint: 0.49 },
    constraints: { budget: 5000 },
    social: { degree: 0.71, community: "TikTokクリエイター" }
  },
  {
    agent_id: "agent-407",
    projectId: "projectB",
    segment: "店舗マネージャー",
    traits: { novelty: 0.48, price_sensitivity: 0.4, time_constraint: 0.7 },
    constraints: { time: 4 },
    social: { degree: 0.6, community: "小売DX研究会" }
  },
  {
    agent_id: "agent-509",
    projectId: "projectC",
    segment: "営業トレーナー",
    traits: { novelty: 0.6, price_sensitivity: 0.55, time_constraint: 0.65 },
    constraints: { budget: 9000 },
    social: { degree: 0.58, community: "英語勉強会" }
  }
];

export const reactions: Reaction[] = [
  {
    id: "reaction-001",
    ideaId: "idea-video-concierge-a",
    projectId: "projectA",
    version: "A",
    personaId: "agent-001",
    text: "卒業制作が迫っているのでAIが粗編集してくれるのは助かる。",
    likelihood: 0.66,
    intent_to_try: 0.61,
    createdAt: ts(5, 27),
    segment: "学生 / クリエイター志望"
  },
  {
    id: "reaction-002",
    ideaId: "idea-video-concierge-b",
    projectId: "projectA",
    version: "B",
    personaId: "agent-304",
    text: "テンプレは便利だけど独自性を出せるカスタム例が知りたい。",
    likelihood: 0.54,
    intent_to_try: 0.49,
    createdAt: ts(5, 24),
    segment: "学生 / クリエイター志望"
  },
  {
    id: "reaction-003",
    ideaId: "idea-ai-reception-a",
    projectId: "projectB",
    version: "A",
    personaId: "agent-102",
    text: "新人研修の時間が半分になりそう。料金は許容できる。",
    likelihood: 0.78,
    intent_to_try: 0.73,
    createdAt: ts(5, 26),
    segment: "小売 / 接客リーダー"
  },
  {
    id: "reaction-004",
    ideaId: "idea-ai-reception-b",
    projectId: "projectB",
    version: "B",
    personaId: "agent-407",
    text: "POS連携の設定が簡単ならぜひ試したい。",
    likelihood: 0.7,
    intent_to_try: 0.65,
    createdAt: ts(5, 23),
    segment: "店舗マネージャー"
  },
  {
    id: "reaction-005",
    ideaId: "idea-english-routine-a",
    projectId: "projectC",
    version: "A",
    personaId: "agent-203",
    text: "Slack通知で続けられそう。音声レッスンの質も気になる。",
    likelihood: 0.62,
    intent_to_try: 0.58,
    createdAt: ts(5, 23),
    segment: "社会人 / 海外営業"
  },
  {
    id: "reaction-006",
    ideaId: "idea-english-routine-b",
    projectId: "projectC",
    version: "B",
    personaId: "agent-509",
    text: "営業シナリオの対話練習は面白いが、通信環境依存が気になる。",
    likelihood: 0.58,
    intent_to_try: 0.52,
    createdAt: ts(5, 22),
    segment: "営業トレーナー"
  }
];

export const ragDocs: RagDoc[] = [
  {
    id: "rag-001",
    projectId: "projectA",
    kind: "review",
    source: "note.com/creator-trend",
    excerpt: "AI編集ツール比較でテンプレ柔軟性と納期短縮が高評価。",
    updatedAt: ts(5, 24)
  },
  {
    id: "rag-002",
    projectId: "projectB",
    kind: "pricing",
    source: "retail-tech.jp",
    excerpt: "小売向けSaaSのトライアル価格は月5000〜9000円帯が主流。",
    updatedAt: ts(5, 21)
  },
  {
    id: "rag-003",
    projectId: "projectA",
    kind: "policy",
    source: "mext.go.jp",
    excerpt: "教育用途AIの透明性ガイドライン。生成物ラベリング義務を明記。",
    updatedAt: ts(5, 19)
  },
  {
    id: "rag-004",
    projectId: "projectC",
    kind: "trend",
    source: "trend-analytics.ai",
    excerpt: "英語学習アプリ利用は朝7時と夜22時がピーク。音声コンテンツが伸長。",
    updatedAt: ts(5, 26)
  }
];
