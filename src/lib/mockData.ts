/**
 * @file Mock dataset powering the UI-only MVP for the Needs Research App.
 * @remarks Dataset supports multiple projects and idea versions so the UI can toggle contexts.
 */
import {
  Contribution,
  Idea,
  Persona,
  PersonaProfile,
  Project,
  RagDoc,
  Reaction,
  Score
} from "./types";

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
    ltv: 82000,
    revenue_forecast: [
      { month: 1, revenue: 540000, profit: 216000 },
      { month: 3, revenue: 1620000, profit: 648000 },
      { month: 12, revenue: 6520000, profit: 2608000 }
    ],
    improvement_suggestions: [
      "オンボーディングでのAIガイダンスを追加し、初回体験での離脱率を下げる。",
      "チームアカウント割引をテストし、アップセルからLTVを押し上げる。"
    ],
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
    ltv: 88000,
    revenue_forecast: [
      { month: 1, revenue: 500000, profit: 200000 },
      { month: 3, revenue: 1510000, profit: 604000 },
      { month: 12, revenue: 6100000, profit: 2440000 }
    ],
    improvement_suggestions: [
      "テンプレートの人気データをダッシュボード化し、再利用率を高めて継続率を向上させる。",
      "価格と機能パッケージのバリエーションをA/Bテストし、PMFを確認する。"
    ],
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
    ltv: 138000,
    revenue_forecast: [
      { month: 1, revenue: 980000, profit: 441000 },
      { month: 3, revenue: 3120000, profit: 1404000 },
      { month: 12, revenue: 12350000, profit: 5557500 }
    ],
    improvement_suggestions: [
      "POS連携のセットアップフローを最適化し、導入初期の工数を30%削減する。",
      "ロールプレイの成功事例ライブラリを公開し、現場スタッフの利用継続を促す。"
    ],
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
    ltv: 132000,
    revenue_forecast: [
      { month: 1, revenue: 920000, profit: 414000 },
      { month: 3, revenue: 2880000, profit: 1296000 },
      { month: 12, revenue: 11600000, profit: 5220000 }
    ],
    improvement_suggestions: [
      "トップ店舗の成功指標をKPIボードで共有し、導入後の活用法を明確にする。",
      "リーダー向けコーチングプログラムを加え、追加収益とLTVを向上。"
    ],
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
    ltv: 58000,
    revenue_forecast: [
      { month: 1, revenue: 320000, profit: 128000 },
      { month: 3, revenue: 960000, profit: 384000 },
      { month: 12, revenue: 3660000, profit: 1464000 }
    ],
    improvement_suggestions: [
      "朝活コミュニティの成功体験をSNS広告に活用し、申込率を底上げする。",
      "法人向けグループプランを追加し、まとめ契約でLTVを引き上げる。"
    ],
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
    ltv: 61000,
    revenue_forecast: [
      { month: 1, revenue: 350000, profit: 140000 },
      { month: 3, revenue: 1050000, profit: 420000 },
      { month: 12, revenue: 3800000, profit: 1520000 }
    ],
    improvement_suggestions: [
      "ライブ対話モードの満足度調査を実施し、改善ポイントを次リリースで対応する。",
      "社内ポータルでの紹介コンテンツを強化し、初回利用の障壁を下げる。"
    ],
    verdict: "Improve"
  }
];

export const personaProfiles: PersonaProfile[] = [
  {
    id: "persona-innovator-01",
    persona_name: "坂本 海斗",
    age_range: "30代",
    occupation: "スタートアップCOO",
    seniority: "経営層",
    location: "東京都 / リモートワーク中心",
    role_context: "COOとして営業・CS組織を横断管理し、事業拡大を担う。",
    mission: "ARRを倍増させるための仕組み作りと組織拡張。",
    decision_authority: "1000万円までの投資判断を単独で決裁可能。",
    environment: "SaaSスタートアップ / 150名規模 / シリーズC",
    decision_style: "計画型",
    background_summary: "コンサル出身で、2社目のスタートアップを支援。データドリブンな経営を好む。",
    values: ["成長と挑戦", "透明性", "チームの自律性"],
    motivations: ["市場をリードするプロダクトづくり", "チームを最大パフォーマンスに導く"],
    success_metrics: ["ARRの前年同期比成長率", "CS解約率", "新規顧客への導入スピード"],
    pain_points: ["意思決定プロセスが複雑", "導入時の社内教育コスト", "既存ツールとの連携負荷"],
    buying_triggers: ["ROI試算が明確", "成功事例が豊富", "導入サポートが充実"],
    objections: ["データセキュリティの懸念", "既存プロセスとの齟齬"],
    behavior_insights: {
      routines: "毎朝ダッシュボードで主要指標を確認。週末は業界イベントに参加。",
      research_channels: ["Quartz", "TechCrunch Japan", "LinkedIn", "Circleコミュニティ"],
      tools: ["Notion", "Asana", "Amplitude", "Looker"],
      budget_range: "月額 50〜120万円",
      decision_timeframe: "2〜3ヶ月で導入判断"
    },
    scenario_responses: {
      evaluating_new_solution: "ROIシミュレーションと既存プロセスへの影響をレビューする。",
      approval_process: "CEOと財務責任者に2週間以内の合意を取り付ける。",
      risk_mitigation: "スモールスタートし、パイロットで指標を検証してから全社展開する。"
    },
    network: {
      communities: ["SaaS Leaders Japan", "B Dash Camp"],
      influencers: ["業界アドバイザー（元COO）", "VCパートナー"],
      decision_partners: ["CEO", "VP of Sales", "Finance Manager"]
    },
    future_outlook: "海外展開を見据えた組織再編と、AI活用による意思決定自動化を進めたい。",
    traits: {
      innovation_interest: 5,
      critical_thinking: 4,
      frugality: 3,
      empathy: 3,
      risk_sensitivity: 4
    },
    personality_tags: ["イノベーティブ", "洞察型", "堅実志向"],
    createdAt: ts(5, 12),
    updatedAt: ts(5, 24)
  },
  {
    id: "persona-student-01",
    persona_name: "村上 彩音",
    age_range: "20代",
    occupation: "映像専門学生",
    seniority: "学生",
    location: "東京都 / 実家暮らし",
    role_context: "映像制作専攻3年生。SNSでの作品発信とフリーランス案件を両立。",
    mission: "卒業制作で受賞し、卒業後はフリーランスとして独立すること。",
    decision_authority: "学費・制作費は自分の貯蓄とアルバイトで捻出。",
    environment: "映像専門学校 / 1クラス24名 / 協働制作多数",
    decision_style: "直感型",
    background_summary: "高校時代から動画編集を独学。SNSで小規模案件を獲得し、現在も増加中。",
    values: ["自己表現", "スピード感", "コミュニティとのつながり"],
    motivations: ["作品が多くの人に届くこと", "スキルアップのフィードバック"],
    success_metrics: ["SNSでの反応数", "案件単価", "作品の完成度"],
    pain_points: ["制作環境の整備コスト", "締切の重複", "クライアントコミュニケーション"],
    buying_triggers: ["無料トライアルの有無", "実績あるクリエイターの推薦", "時短につながる機能"],
    objections: ["学習コストが高そう", "月額費用の負担", "操作が複雑"],
    behavior_insights: {
      routines: "毎朝SNSでトレンドチェックし、夜に編集時間を確保。",
      research_channels: ["YouTube", "TikTok", "Discordコミュニティ", "note"],
      tools: ["Premiere Pro", "After Effects", "Figma", "Notion"],
      budget_range: "月額 5〜12万円（ツール・学習費）",
      decision_timeframe: "興味があれば即日〜1週間で導入"
    },
    scenario_responses: {
      evaluating_new_solution: "使っているクリエイターの作例や声を探して判断。",
      approval_process: "必要あれば講師・先輩に相談してレビューをもらう。",
      risk_mitigation: "トライアルでテストし、案件で使えるかを確認後に有料移行。"
    },
    network: {
      communities: ["映像研究サークル", "クリエイターGuild", "note合評会"],
      influencers: ["人気映像クリエイター2名"],
      decision_partners: ["制作チームのメンバー", "講師"]
    },
    future_outlook: "海外案件への対応やCG分野への挑戦を視野に入れている。",
    traits: {
      innovation_interest: 4,
      critical_thinking: 2,
      frugality: 2,
      empathy: 4,
      risk_sensitivity: 2
    },
    personality_tags: ["好奇心旺盛", "共感型", "挑戦型"],
    createdAt: ts(5, 5),
    updatedAt: ts(5, 26)
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
