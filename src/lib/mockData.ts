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
    id: "persona-matsuda-daiki",
    persona_name: "松田 大喜",
    age_range: "20代",
    occupation: "SESエンジニア",
    seniority: "学生",
    location: "東京都",
    role_context: "新規事業を開発しまくり大当てすることに注力している。",
    mission: "新規事業を開発しまくり大当てする。",
    decision_authority: "MAX50万？",
    environment: "SES、10名弱規模",
    decision_style: "計画型",
    background_summary: "都立高校、東大出身。2回留年。アクセンチュア就職予定。",
    values: ["圧倒的成長"],
    motivations: ["最強の男になりたい"],
    success_metrics: ["昨日の自分に勝ってるか？"],
    pain_points: ["昨日の自分に負けてるかもしれない"],
    buying_triggers: ["コスパ、新規性"],
    objections: ["予算不足"],
    behavior_insights: {
      routines: "開発、勉強、筋トレを習慣にする（ことを目標にしている）",
      research_channels: ["X"],
      tools: ["ChatGPT"],
      budget_range: "月額1〜20万円",
      decision_timeframe: "最短即日で導入判断"
    },
    scenario_responses: {
      evaluating_new_solution: "ワクワクしてしまう",
      approval_process: "CEOと財務責任者の合意を2週間以内に取得。",
      risk_mitigation: "スモールスタートで検証し、指標を見て全社展開を判断。"
    },
    network: {
      communities: ["かわいい界隈"],
      influencers: ["藍染惣右介"],
      decision_partners: ["CEO"]
    },
    future_outlook: "バイバー組織としての成長、AI Wrapperとしてのプロダクト量産を目指す。",
    traits: {
      innovation_interest: 5,
      critical_thinking: 3,
      frugality: 2,
      empathy: 5,
      risk_sensitivity: 2
    },
    personality_tags: ["挑戦型", "成長志向"],
    createdAt: ts(5, 1),
    updatedAt: ts(5, 28)
  },
  {
    id: "persona-egami-kosuke",
    persona_name: "江上 広介",
    age_range: "20代",
    occupation: "IT開発会社代表",
    seniority: "自営業",
    location: "東京都",
    role_context: "事業計画の策定から営業・開発まで一人で担う。",
    mission: "世界規模で使われるプロダクトの開発",
    decision_authority: "未定",
    environment: "一人会社",
    decision_style: "えいや型",
    background_summary: "都立高校、早稲田大卒。受託開発会社での経験を経てフリーランスに。プロダクト開発のため会社を設立。",
    values: ["何を作ったか"],
    motivations: ["新しいものを作りたい"],
    success_metrics: ["いいものが作れているか？"],
    pain_points: ["いいものが作れていないかもしれない"],
    buying_triggers: ["性能", "生産性向上"],
    objections: ["既存の組み合わせでできる"],
    behavior_insights: {
      routines: "ない",
      research_channels: ["X", "Gigazine", "Reddit"],
      tools: ["ChatGPT", "Gemini", "Claude", "Github Copilot"],
      budget_range: "月額10万円",
      decision_timeframe: "1週間ほど"
    },
    scenario_responses: {
      evaluating_new_solution: "批判的に考える。新規性があるかを見る",
      approval_process: "私がOKすればOK",
      risk_mitigation: "クライアントがいれば謝罪・対応報告して修正対応する。"
    },
    network: {
      communities: ["AI界隈"],
      influencers: ["アラン・ケイ", "ピーター・ティール"],
      decision_partners: ["自分"]
    },
    future_outlook: "金持ちにならなくてもいいけど、でかいことやっていたい。",
    traits: {
      innovation_interest: 5,
      critical_thinking: 5,
      frugality: 3,
      empathy: 2,
      risk_sensitivity: 3
    },
    personality_tags: ["ビルダー", "批判的思考"],
    createdAt: ts(5, 2),
    updatedAt: ts(5, 28)
  },
  {
    id: "persona-kosuge-shuji",
    persona_name: "小菅 秀二",
    age_range: "20代",
    occupation: "SESエンジニア",
    seniority: "フリーター",
    location: "東京都",
    role_context: "受託案件の開発実装を担当。",
    mission: "夢をみる",
    decision_authority: "価値に見合った金額",
    environment: "SES、10名弱規模",
    decision_style: "慎重型",
    background_summary: "私立高校中退、通信制高校卒業後、フリーターとして開発に従事。",
    values: ["面白い方へ"],
    motivations: ["特化型になりたい"],
    success_metrics: ["マイナスを覆せるほどの強さを持っているか"],
    pain_points: ["考えすぎて思い切りが弱い"],
    buying_triggers: ["文句が出ないほどの完璧さ"],
    objections: ["後手に回る"],
    behavior_insights: {
      routines: "仕事",
      research_channels: ["X"],
      tools: ["ChatGPT", "Cursor"],
      budget_range: "月額1〜20万円",
      decision_timeframe: "完璧な結論が出てから"
    },
    scenario_responses: {
      evaluating_new_solution: "感動する",
      approval_process: "チームで話し合ってCEOが決定",
      risk_mitigation: "できる範囲を即対応して時間に余裕を作って大きいところの対応をする"
    },
    network: {
      communities: ["二郎界隈"],
      influencers: ["いろんな人のいいと思ったところをいただく"],
      decision_partners: ["チームメンバー全員"]
    },
    future_outlook: "スーパーエンジニアとして活躍することを目指す。",
    traits: {
      innovation_interest: 5,
      critical_thinking: 4,
      frugality: 2,
      empathy: 3,
      risk_sensitivity: 5
    },
    personality_tags: ["慎重派", "職人肌"],
    createdAt: ts(5, 3),
    updatedAt: ts(5, 28)
  },
  {
    id: "persona-kosuge-taihei",
    persona_name: "小菅 太平",
    age_range: "20代",
    occupation: "SES会社代表",
    seniority: "自営業",
    location: "東京都",
    role_context: "CEOとして組織運営とクライアント管理を担う。",
    mission: "会社の成長に責任を持つ",
    decision_authority: "50万",
    environment: "SES、10名弱規模",
    decision_style: "計画型",
    background_summary: "都立高校、早稲田理工卒業。2回留年を経て大学院進学予定で学生起業。",
    values: ["好奇心を満たす"],
    motivations: ["好奇心を最大限満たしたい"],
    success_metrics: ["新しい学びがあったか"],
    pain_points: ["羽ばたきが我慢できない、生き急いでしまう"],
    buying_triggers: ["定性的・定量的な側面を総合し経営的メリットがあるか"],
    objections: ["予算不足"],
    behavior_insights: {
      routines: "仕事、勉強、飲み会",
      research_channels: ["読書", "X"],
      tools: ["ChatGPT", "Canva"],
      budget_range: "月額1〜20万円",
      decision_timeframe: "1週間から1ヶ月程度"
    },
    scenario_responses: {
      evaluating_new_solution: "ポジティブな側面ばかり見る",
      approval_process: "役員会議で決定",
      risk_mitigation: "落ち着くことを意識する"
    },
    network: {
      communities: ["２留界隈"],
      influencers: ["実業家", "少年漫画の主人公"],
      decision_partners: ["役員"]
    },
    future_outlook: "会社の急成長により環境は大きく変化するだろう。",
    traits: {
      innovation_interest: 3,
      critical_thinking: 2,
      frugality: 2,
      empathy: 5,
      risk_sensitivity: 3
    },
    personality_tags: ["好奇心旺盛", "共感型"],
    createdAt: ts(5, 4),
    updatedAt: ts(5, 28)
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
