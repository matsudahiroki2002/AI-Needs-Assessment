/**
 * @file Promise-based mock API client, isolating future server communication in one place.
 * @remarks Preserve function signatures when replacing the mock with real fetch calls to avoid cascading UI changes.
 */
import {
  contributions as seededContributions,
  ideas as seededIdeas,
  personas as seededPersonas,
  personaProfiles as seededPersonaProfiles,
  projects as seededProjects,
  ragDocs as seededRagDocs,
  reactions as seededReactions,
  scores as seededScores
} from "./mockData";

import type {
  Contribution,
  Idea,
  Persona,
  PersonaProfile,
  Project,
  RagDoc,
  Reaction,
  RevenueForecast,
  Score,
  SimulationRequest,
  SimulationPersonaReaction,
  SimulationResult
} from "./types";

const NETWORK_DELAY_MS = 180;
const PAGE_SIZE = 6;

const projectStore: Project[] = [...seededProjects];
const ideaStore: Idea[] = [...seededIdeas];
const scoreStore: Score[] = [...seededScores];
const contributionStore: Contribution[] = [...seededContributions];
const reactionStore: Reaction[] = [...seededReactions];
const ragStore: RagDoc[] = [...seededRagDocs];
const personaStore: Persona[] = [...seededPersonas];
const personaRegistryStore: PersonaProfile[] = [...seededPersonaProfiles];
const defaultSimulationPersonaPool: PersonaProfile[] = [
  {
    id: "persona-demo-a",
    persona_name: "モック学生A",
    age_range: "20代",
    occupation: "動画クリエイター志望",
    decision_style: "直感型",
    values: ["自己表現"],
    motivations: ["作品を多くの人に届けたい"],
    success_metrics: ["SNSでの反応数"],
    pain_points: ["制作時間の不足"],
    buying_triggers: ["即効性のある時短機能"],
    objections: ["高額なサブスク費用"],
    behavior_insights: {
      research_channels: ["YouTube", "TikTok"],
      tools: ["Premiere Pro", "Notion"]
    },
    scenario_responses: {},
    network: {
      communities: [],
      influencers: [],
      decision_partners: []
    },
    traits: {
      innovation_interest: 4,
      critical_thinking: 2,
      frugality: 3,
      empathy: 4,
      risk_sensitivity: 2
    },
    personality_tags: ["好奇心旺盛", "挑戦型"],
    createdAt: "2024-01-05T09:00:00.000Z",
    updatedAt: "2024-01-05T09:00:00.000Z"
  },
  {
    id: "persona-demo-b",
    persona_name: "モック決裁者B",
    age_range: "30代",
    occupation: "スタートアップCOO",
    decision_style: "計画型",
    values: ["成長と挑戦"],
    motivations: ["チームを高い成果へ導く"],
    success_metrics: ["ARR成長率"],
    pain_points: ["導入時の社内調整"],
    buying_triggers: ["ROIの明確化"],
    objections: ["リスクが不透明"],
    behavior_insights: {
      research_channels: ["LinkedIn"],
      tools: ["Notion", "Asana"]
    },
    scenario_responses: {},
    network: {
      communities: [],
      influencers: [],
      decision_partners: []
    },
    traits: {
      innovation_interest: 5,
      critical_thinking: 4,
      frugality: 4,
      empathy: 3,
      risk_sensitivity: 4
    },
    personality_tags: ["イノベーティブ", "堅実志向", "洞察型"],
    createdAt: "2024-01-04T09:00:00.000Z",
    updatedAt: "2024-01-04T09:00:00.000Z"
  }
];

const simulateNetwork = <T>(data: T, signal?: AbortSignal) =>
  new Promise<T>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    const onAbort = () => {
      if (timer) {
        clearTimeout(timer);
      }
      reject(new DOMException("Aborted", "AbortError"));
    };

    timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve(JSON.parse(JSON.stringify(data)) as T);
    }, NETWORK_DELAY_MS);

    signal?.addEventListener("abort", onAbort, { once: true });
  });

const generateId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;

const slugify = (input: string) => {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || `project-${Math.random().toString(36).slice(2, 8)}`;
};

const getApiBaseUrl = () => {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL;
  if (!base) return undefined;
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const parsePersonaResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail ?? "Failed to fetch personas");
  }
  return data;
};

const applySimulationSideEffects = (
  results: SimulationResult[],
  updatedScores?: Score[],
  req?: SimulationRequest
) => {
  if (Array.isArray(updatedScores)) {
    updatedScores.forEach((score) => upsertScore(score));
  }
  if (!Array.isArray(results) || results.length === 0) {
    return;
  }

  const now = new Date().toISOString();
  results.forEach((result) => {
    const idea = result.ideaId ? ideaStore.find((item) => item.id === result.ideaId) : undefined;
    result.personaReactions.forEach((reaction) => {
      reactionStore.unshift({
        id: generateId("reaction"),
        ideaId: result.ideaId ?? idea?.id ?? ideaStore[0]?.id ?? "idea",
        projectId: idea?.projectId ?? ideaStore[0]?.projectId ?? "projectA",
        version: idea?.version,
        personaId: reaction.personaId,
        text: reaction.comment,
        likelihood: reaction.intent_to_try,
        intent_to_try: reaction.intent_to_try,
        createdAt: now,
        segment: req?.filters?.segment ?? idea?.target
      });
    });
  });

  if (reactionStore.length > 50) {
    reactionStore.splice(50);
  }
};

const findScore = (ideaId: string): Score => {
  const idea = ideaStore.find((entry) => entry.id === ideaId);
  const fallback: Score = {
    ideaId,
    projectId: idea?.projectId,
    version: idea?.version,
    psf: 50,
    pmf: 50,
    ci95: { low: 40, high: 60 },
    p_apply: [0.25, 0.35],
    p_purchase: [0.18, 0.28],
    p_d7: [0.3, 0.4],
    ltv: idea ? Math.round(idea.price * 12 * 0.6) : 60000,
    revenue_forecast: [
      { month: 1, revenue: idea ? Math.round(idea.price * 32) : 300000, profit: idea ? Math.round(idea.price * 32 * 0.4) : 120000 },
      { month: 3, revenue: idea ? Math.round(idea.price * 96 * 1.1) : 900000, profit: idea ? Math.round(idea.price * 96 * 0.45) : 360000 },
      { month: 12, revenue: idea ? Math.round(idea.price * 384 * 1.2) : 3600000, profit: idea ? Math.round(idea.price * 384 * 0.5) : 1800000 }
    ],
    improvement_suggestions: [
      "申込から利用開始までのリードタイムを短縮する施策を検討してください。",
      "価格パッケージと導入サポートの見直しによりLTV向上を図りましょう。"
    ],
    verdict: "Improve"
  };

  const stored = scoreStore.find((entry) => entry.ideaId === ideaId);
  if (!stored) {
    return fallback;
  }

  return {
    ...stored,
    projectId: stored.projectId ?? idea?.projectId,
    version: stored.version ?? idea?.version
  };
};

export const api = {
  async listProjects(signal?: AbortSignal): Promise<Project[]> {
    return simulateNetwork([...projectStore], signal);
  },
  async createProject(
    input: { name: string },
    signal?: AbortSignal
  ): Promise<Project> {
    const now = new Date().toISOString();
    const baseSlug = slugify(input.name);
    let slug = baseSlug;
    let suffix = 1;
    while (projectStore.some((project) => project.id === slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }
    const project: Project = {
      id: slug,
      name: input.name.trim(),
      createdAt: now,
      updatedAt: now
    };
    projectStore.push(project);
    return simulateNetwork(project, signal);
  },
  async listIdeas(projectId?: string, signal?: AbortSignal): Promise<Idea[]> {
    // TODO(api): 実サーバ接続時にfetchへ置換
    const filtered = projectId
      ? ideaStore.filter((idea) => idea.projectId === projectId)
      : ideaStore;
    const sorted = [...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return simulateNetwork(sorted, signal);
  },
  async createIdea(
    input: Omit<Idea, "id" | "createdAt" | "updatedAt">,
    signal?: AbortSignal
  ): Promise<Idea> {
    // TODO(api): 実サーバ接続時にfetchへ置換
    const now = new Date().toISOString();
    if (!projectStore.some((project) => project.id === input.projectId)) {
      projectStore.push({
        id: input.projectId,
        name: input.projectId,
        createdAt: now,
        updatedAt: now
      });
    }
    const idea: Idea = {
      ...input,
      version: input.version ?? "A",
      id: generateId(`${input.projectId}-${input.version ?? "ver"}`),
      createdAt: now,
      updatedAt: now
    };
    ideaStore.unshift(idea);

    const baseMonthlyRevenue = Math.max(60000, Math.round(idea.price * 32));
    const forecastData = [
      { month: 1, revenue: baseMonthlyRevenue, profit: Math.round(baseMonthlyRevenue * 0.4) },
      { month: 3, revenue: Math.round(baseMonthlyRevenue * 3 * 1.15), profit: Math.round(baseMonthlyRevenue * 3 * 0.45) },
      { month: 12, revenue: Math.round(baseMonthlyRevenue * 12 * 1.25), profit: Math.round(baseMonthlyRevenue * 12 * 0.48) }
    ];
    const score: Score = {
      ideaId: idea.id,
      projectId: idea.projectId,
      version: idea.version,
      psf: 55,
      pmf: 51,
      ci95: { low: 43, high: 63 },
      p_apply: [0.3, 0.4],
      p_purchase: [0.2, 0.28],
      p_d7: [0.32, 0.43],
      ltv: Math.round(idea.price * 12 * 0.65),
      revenue_forecast: forecastData,
      improvement_suggestions: [
        "オンボーディングメールを自動化し、初期アクティブ率の底上げを図りましょう。",
        "価格プランと支払いサイクルのバリエーションをテストし、LTV最大化のシナリオを検証してください。"
      ],
      verdict: "Improve"
    };
    scoreStore.unshift(score);

    contributionStore.unshift({
      ideaId: idea.id,
      projectId: idea.projectId,
      version: idea.version,
      factors: [
        { name: "課題の適合度", value: 20 },
        { name: "独自性", value: 18 },
        { name: "価格受容度", value: 14 },
        { name: "導入容易性", value: 12 },
        { name: "継続可能性", value: 11 }
      ]
    });

    reactionStore.unshift({
      id: generateId("reaction"),
      ideaId: idea.id,
      projectId: idea.projectId,
      version: idea.version,
      personaId: "agent-203",
      text: "新しい切り口で興味深いが、まずは試験導入で効果を確かめたい。",
      likelihood: 0.55,
      intent_to_try: 0.49,
      createdAt: now,
      segment: input.target
    });

    return simulateNetwork(idea, signal);
  },
  async getScores(ideaIds: string[], signal?: AbortSignal): Promise<Score[]> {
    // TODO(api): 実サーバ接続時にfetchへ置換
    const payload = ideaIds.map(findScore);
    return simulateNetwork(payload, signal);
  },
  async getContributions(ideaId: string, signal?: AbortSignal): Promise<Contribution> {
    // TODO(api): 実サーバ接続時にfetchへ置換
    const contribution =
      contributionStore.find((entry) => entry.ideaId === ideaId) ??
      contributionStore[0] ??
      ({
        ideaId,
        projectId: ideaStore.find((idea) => idea.id === ideaId)?.projectId,
        version: ideaStore.find((idea) => idea.id === ideaId)?.version,
        factors: [
          { name: "情報不足", value: 18 },
          { name: "体験価値の明確化", value: 16 },
          { name: "価格認知", value: 15 },
          { name: "導入のしやすさ", value: 14 },
          { name: "継続運用の安心感", value: 13 }
        ]
      } as Contribution);
    return simulateNetwork(contribution, signal);
  },
  async getReactions(
    ideaId: string,
    params?: { segment?: string; page?: number },
    signal?: AbortSignal
  ): Promise<{ reactions: Reaction[]; total: number; segments: string[] }> {
    // TODO(api): 実サーバ接続時にfetchへ置換
    const { segment, page = 1 } = params ?? {};
    const all = reactionStore.filter(
      (reaction) =>
        reaction.ideaId === ideaId && (!segment || reaction.segment === segment)
    );
    const start = (page - 1) * PAGE_SIZE;
    const paginated = all.slice(start, start + PAGE_SIZE);
    const segments = Array.from(
      new Set(
        reactionStore
          .filter((reaction) => reaction.ideaId === ideaId)
          .map((reaction) => reaction.segment)
          .filter(Boolean)
      )
    ) as string[];
    return simulateNetwork({ reactions: paginated, total: all.length, segments }, signal);
  },
  async getPersonas(
    params?: { segment?: string; projectId?: string },
    signal?: AbortSignal
  ): Promise<Persona[]> {
    // TODO(api): 実サーバ接続時にfetchへ置換
    const filtered = personaStore.filter((persona) => {
      const matchesSegment = params?.segment ? persona.segment === params.segment : true;
      const matchesProject = params?.projectId ? persona.projectId === params.projectId : true;
      return matchesSegment && matchesProject;
    });
    return simulateNetwork(filtered, signal);
  },
  async listPersonaProfiles(signal?: AbortSignal): Promise<PersonaProfile[]> {
    const baseUrl = getApiBaseUrl();
    if (baseUrl) {
      const response = await fetch(`${baseUrl}/personas`, {
        signal
      });
      const payload = await parsePersonaResponse(response);
      return payload as PersonaProfile[];
    }

    return simulateNetwork([...personaRegistryStore], signal);
  },
  async createPersonaProfile(
    input: Omit<PersonaProfile, "id" | "createdAt" | "updatedAt">,
    signal?: AbortSignal
  ): Promise<PersonaProfile> {
    const baseUrl = getApiBaseUrl();
    if (baseUrl) {
      const response = await fetch(`${baseUrl}/personas`, {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
      });
      const payload = await parsePersonaResponse(response);
      return payload as PersonaProfile;
    }

    const now = new Date().toISOString();
    const persona: PersonaProfile = {
      id: generateId("persona"),
      createdAt: now,
      updatedAt: now,
      ...input
    };
    personaRegistryStore.push(persona);
    return simulateNetwork(persona, signal);
  },
  async getRagDocs(
    params?: { kind?: RagDoc["kind"]; q?: string; projectId?: string },
    signal?: AbortSignal
  ): Promise<RagDoc[]> {
    // TODO(api): 実サーバ接続時にfetchへ置換
    const { kind, q, projectId } = params ?? {};
    const keyword = q?.toLowerCase();
    const filtered = ragStore.filter((doc) => {
      const matchesKind = kind ? doc.kind === kind : true;
      const matchesProject = projectId ? doc.projectId === projectId : true;
      const matchesQuery = keyword
        ? [doc.source, doc.excerpt].some((value) =>
            value.toLowerCase().includes(keyword)
          )
        : true;
      return matchesKind && matchesProject && matchesQuery;
    });
    return simulateNetwork(filtered, signal);
  },

  async simulate(
    req: SimulationRequest,
    signal?: AbortSignal,
    options?: { apiKey?: string; model?: string; routeHandler?: boolean }
  ): Promise<SimulationResult[]> {
    const baseUrl = getApiBaseUrl();
    const body = JSON.stringify(req);

    if (options?.routeHandler) {
      const apiKey = options.apiKey;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured on server.");
      }
      const model = options.model ?? process.env.NEXT_PUBLIC_OPENAI_MODEL ?? "gpt-4.1-mini";
      return simulateWithOpenAIInternal(req, apiKey, model, signal);
    }

    if (baseUrl) {
      try {
        const response = await fetch(`${baseUrl}/simulate`, {
          method: "POST",
          signal,
          headers: { "Content-Type": "application/json" },
          body
        });
        if (response.ok) {
          const payload = await response.json();
          if (Array.isArray(payload)) {
            const results = payload as SimulationResult[];
            applySimulationSideEffects(results, undefined, req);
            return results;
          }
          if (payload && payload.results && payload.updatedScores) {
            const results = payload.results as SimulationResult[];
            applySimulationSideEffects(results, payload.updatedScores as Score[], req);
            return results;
          }
          return [] as SimulationResult[];
        }
        console.warn("[simulate] backend returned", response.status, await response.text());
      } catch (error) {
        console.warn("[simulate] backend request failed", error);
      }
    }

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json" },
        body
      });
      if (response.ok) {
        const payload = await response.json();
        if (Array.isArray(payload)) {
          const results = payload as SimulationResult[];
          applySimulationSideEffects(results, undefined, req);
          return results;
        }
        if (payload && payload.results && payload.updatedScores) {
          const results = payload.results as SimulationResult[];
          applySimulationSideEffects(results, payload.updatedScores as Score[], req);
          return results;
        }
        return [] as SimulationResult[];
      }
      console.warn("[simulate] /api/simulate returned", response.status, await response.text());
    } catch (error) {
      console.warn("[simulate] /api/simulate request failed", error);
    }

    return simulateNetwork(simulateWithMock(req), signal);
  }
};

function simulateWithMock(req: SimulationRequest): SimulationResult[] {
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const personaPool =
    personaRegistryStore.length > 0 ? personaRegistryStore : defaultSimulationPersonaPool;
  const personas = [...personaPool]
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const timeB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 10);

  return req.ideaIds.map((id) => {
    const baseScore = findScore(id);
    const idea = ideaStore.find((entry) => entry.id === id);
    const personaReactions: SimulationPersonaReaction[] = personas.map((persona, index) => {
      const intentBase = clamp(baseScore.p_apply[1] - 0.06 + index * 0.05);
      const priceBase = clamp(baseScore.p_purchase[1] - 0.04 + index * 0.04);
      return {
        personaId: persona.id,
        personaName: persona.persona_name,
        category: `${persona.age_range} / ${persona.occupation}`,
        comment:
          persona.decision_style === "計画型"
            ? `${persona.persona_name}は${idea?.title ?? "この案"}をROI視点で検討しています。導入効果を定量化できれば前向きに検討できます。`
            : `${persona.persona_name}は${idea?.title ?? "この案"}に好感を持っています。体験価値を明確にすると意思決定が進みそうです。`,
        intent_to_try: Number(intentBase.toFixed(3)),
        price_acceptance: Number(priceBase.toFixed(3))
      };
    });

    if (idea) {
      const timestamp = new Date().toISOString();
      personaReactions.forEach((reaction, index) => {
        const persona = personas[index] ?? personas[0];
        if (!persona) return;
        reactionStore.unshift({
          id: generateId("reaction"),
          ideaId: idea.id,
          projectId: idea.projectId,
          version: idea.version,
          personaId: persona.id,
          text: reaction.comment,
          likelihood: reaction.intent_to_try,
          intent_to_try: reaction.intent_to_try,
          createdAt: timestamp,
          segment: req.filters?.segment ?? idea.target
        });
      });
      if (reactionStore.length > 50) {
        reactionStore.splice(50);
      }
    }

    const mean = (values: number[]) =>
      values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
    const intents = personaReactions.map((reaction) => reaction.intent_to_try);
    const prices = personaReactions.map((reaction) => reaction.price_acceptance);
    const psf = Number((mean(intents) * 100).toFixed(1));
    const pmf = Number((mean(prices) * 100).toFixed(1));
    const summaryComment =
      personaReactions.length === 0
        ? "ペルソナが未登録のためダミー結果を表示しています。"
        : `${personaReactions.length}名の仮想ペルソナから平均PSF ${psf} / PMF ${pmf} の評価でした。${req.filters?.segment ?? "主要セグメント"}向けに施策を検討しましょう。`;

    return {
      ideaId: idea?.id ?? id,
      ideaTitle: idea?.title,
      projectId: idea?.projectId,
      version: idea?.version,
      psf,
      pmf,
      ci95: baseScore.ci95,
      personaReactions,
      summaryComment
    };
  });
}

async function simulateWithOpenAIInternal(
  req: SimulationRequest,
  apiKey: string,
  model: string,
  signal?: AbortSignal
): Promise<SimulationResult[]> {
  const personas = (personaRegistryStore.length > 0
    ? personaRegistryStore
    : defaultSimulationPersonaPool
  )
    .slice()
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
      const timeB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
      return timeB - timeA;
    })
    .slice(0, 10);

  const ideas = req.ideaIds
    .map((id) => ideaStore.find((idea) => idea.id === id))
    .filter((idea): idea is Idea => Boolean(idea));

  if (ideas.length === 0) {
    return [];
  }

  const systemPrompt = "You are an experienced product analyst. Respond strictly in JSON.";

  const userPayload = {
    request: req,
    ideas: ideas.map((idea) => ({
      id: idea.id,
      title: idea.title,
      description: {
        target: idea.target,
        pain: idea.pain,
        solution: idea.solution,
        price: idea.price,
        channel: idea.channel,
        onboarding: idea.onboarding
      }
    })),
    personas: personas.map((persona) => ({
      id: persona.id,
      name: persona.persona_name,
      age_range: persona.age_range,
      occupation: persona.occupation,
      values: persona.values,
      motivations: persona.motivations,
      success_metrics: persona.success_metrics,
      pain_points: persona.pain_points,
      buying_triggers: persona.buying_triggers,
      objections: persona.objections,
      traits: persona.traits
    }))
  };

  const userPrompt = `Provide simulation results for each idea. Use this schema:

{
  "results": [
    {
      "ideaId": string,
      "psf": number,
      "pmf": number,
      "ci95": { "low": number, "high": number },
      "p_apply": [number, number],
      "p_purchase": [number, number],
      "p_d7": [number, number],
      "ltv": number,
      "revenue_forecast": [
        { "month": 1, "revenue": number, "profit": number },
        { "month": 3, "revenue": number, "profit": number },
        { "month": 12, "revenue": number, "profit": number }
      ],
      "improvement_suggestions": string[],
      "summaryComment": string,
      "personaReactions": [
        {
          "personaId": string,
          "personaName": string,
          "category": string,
          "intent_to_try": number,
          "price_acceptance": number,
          "comment": string
        }
      ]
    }
  ]
}

Raw context:
${JSON.stringify(userPayload, null, 2)}
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
        { role: "user", content: [{ type: "input_text", text: userPrompt }] }
      ]
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "OpenAI simulation failed");
  }

  const parsed = parseSimulationResponse(payload);
  if (!parsed?.results?.length) {
    console.warn("[simulate] OpenAI response missing results, falling back to mock data.");
    return simulateWithMock(req);
  }

  const results: SimulationResult[] = parsed.results.map((entry: any) => {
    const idea = ideas.find((item) => item.id === entry.ideaId) ?? ideas[0];
    const fallbackScore = findScore(idea.id);

    const psf = normalizeScore(entry.psf, fallbackScore.psf);
    const pmf = normalizeScore(entry.pmf, fallbackScore.pmf);

    const ciLow = normalizeScore(entry.ci95?.low, fallbackScore.ci95.low);
    const ciHigh = normalizeScore(entry.ci95?.high, fallbackScore.ci95.high);

    const pApply = normalizeProbabilityRange(entry.p_apply, fallbackScore.p_apply);
    const pPurchase = normalizeProbabilityRange(entry.p_purchase, fallbackScore.p_purchase);
    const pD7 = normalizeProbabilityRange(entry.p_d7, fallbackScore.p_d7);

    const ltv = normalizeCurrency(entry.ltv, fallbackScore.ltv);
    const revenueForecast = sanitizeRevenueForecast(entry.revenue_forecast, fallbackScore.revenue_forecast);
    const improvementSuggestions = sanitizeStringArray(entry.improvement_suggestions, fallbackScore.improvement_suggestions);

    const personaReactions: SimulationPersonaReaction[] = Array.isArray(entry.personaReactions)
      ? entry.personaReactions.map((reaction: any, index: number) => {
          const fallbackPersona = personas[index] ?? personas[0];
          return {
            personaId: reaction.personaId ?? reaction.persona_id ?? fallbackPersona?.id ?? "persona",
            personaName: reaction.personaName ?? reaction.persona_name ?? fallbackPersona?.persona_name ?? "Persona",
            category: reaction.category ?? `${fallbackPersona?.age_range ?? "-"} / ${fallbackPersona?.occupation ?? "-"}`,
            comment: reaction.comment ?? "",
            intent_to_try: clampProbability(reaction.intent_to_try ?? reaction.intent ?? 0.5),
            price_acceptance: clampProbability(reaction.price_acceptance ?? reaction.price ?? 0.5)
          };
        })
      : personas.slice(0, 3).map((persona) => ({
          personaId: persona.id,
          personaName: persona.persona_name,
          category: `${persona.age_range} / ${persona.occupation}`,
          comment: `${persona.persona_name}は提案に興味を示しています。価格と導入効果の明確化が意思決定の鍵になりそうです。`,
          intent_to_try: 0.54,
          price_acceptance: 0.48
        }));

    const timestamp = new Date().toISOString();
    personaReactions.forEach((reaction) => {
      reactionStore.unshift({
        id: generateId("reaction"),
        ideaId: idea.id,
        projectId: idea.projectId,
        version: idea.version,
        personaId: reaction.personaId,
        text: reaction.comment,
        likelihood: reaction.intent_to_try,
        intent_to_try: reaction.intent_to_try,
        createdAt: timestamp,
        segment: req.filters?.segment ?? idea.target
      });
      });
    if (reactionStore.length > 50) {
      reactionStore.splice(50);
    }

    const updatedScore: Score = {
      ideaId: idea.id,
      projectId: idea.projectId,
      version: idea.version,
      psf,
      pmf,
      ci95: {
        low: Math.min(ciLow, ciHigh),
        high: Math.max(ciLow, ciHigh)
      },
      p_apply: pApply,
      p_purchase: pPurchase,
      p_d7: pD7,
      ltv,
      revenue_forecast: revenueForecast,
      improvement_suggestions: improvementSuggestions,
      verdict: resolveVerdict(entry.verdict, psf, pmf, fallbackScore.verdict)
    };
    upsertScore(updatedScore);

    return {
      ideaId: idea.id,
      ideaTitle: idea.title,
      projectId: idea.projectId,
      version: idea.version,
      psf,
      pmf,
      ci95: {
        low: Math.min(ciLow, ciHigh),
        high: Math.max(ciLow, ciHigh)
      },
      personaReactions,
      summaryComment: entry.summaryComment ?? entry.summary ?? ""
    };
  });

  return results;
}

function parseSimulationResponse(payload: any): any {
  const stripCodeFence = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.startsWith("```")) {
      return trimmed.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    }
    return trimmed;
  };

  const tryParseJson = (input: string | undefined) => {
    if (!input) return undefined;
    const cleaned = stripCodeFence(input);
    try {
      return JSON.parse(cleaned);
    } catch (error) {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start >= 0 && end > start) {
        try {
          return JSON.parse(cleaned.slice(start, end + 1));
        } catch {
          /* ignore */
        }
      }
      console.warn("[simulate] Failed to parse JSON text segment", error);
      return undefined;
    }
  };

  const extractText = (node: any): string | undefined => {
    if (!node) return undefined;
    if (typeof node === "string") return node;
    if (Array.isArray(node)) {
      const merged = node.map((part) => extractText(part)).filter(Boolean).join("");
      return merged.length ? merged : undefined;
    }
    if (typeof node === "object") {
      if (typeof node.text === "string") return node.text;
      if (Array.isArray(node.text)) {
        const merged = node.text
          .map((part: unknown) => extractText(part))
          .filter(Boolean)
          .join("");
        return merged.length ? merged : undefined;
      }
      if (typeof node.text?.value === "string") return node.text.value;
      if (typeof node.value === "string") return node.value;
      if (typeof node.data === "string") return node.data;
      if (node.value && typeof node.value === "object") {
        const nested = extractText(node.value);
        if (nested) return nested;
      }
      if (node.content) {
        const nested = extractText(node.content);
        if (nested) return nested;
      }
    }
    return undefined;
  };

  const inspectNode = (node: any): any => {
    if (!node) return undefined;
    if (Array.isArray(node)) {
      for (const item of node) {
        const parsed = inspectNode(item);
        if (parsed) return parsed;
      }
      return undefined;
    }
    if (typeof node === "string") {
      return tryParseJson(node);
    }
    if (typeof node === "object") {
      if (node.results) return node;
      if (node.json && typeof node.json === "object") return node.json;
      const text = extractText(node);
      const parsedFromText = tryParseJson(text);
      if (parsedFromText) return parsedFromText;
      if (node.content) {
        const nested = inspectNode(node.content);
        if (nested) return nested;
      }
    }
    return undefined;
  };

  const parsed =
    inspectNode(payload?.output) ??
    inspectNode(payload?.output_text) ??
    inspectNode(payload?.text?.value ?? payload?.text) ??
    inspectNode(payload);

  if (!parsed) {
    console.warn("[simulate] Unexpected OpenAI payload", payload);
  }

  return parsed;
}

const clampProbability = (value: unknown, fallback = 0.5) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(1, Math.max(0, num));
};

const normalizeProbability = (value: unknown, fallback: number) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  const scaled = num > 1 ? num / 100 : num;
  const clamped = Math.min(1, Math.max(0, scaled));
  return Number(clamped.toFixed(3));
};

const clampScore = (value: unknown, fallback: number) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(100, Math.max(0, num));
};

const normalizeScore = (value: unknown, fallback: number) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  const scaled = num <= 1 ? num * 100 : num;
  return clampScore(Number(scaled.toFixed(1)), fallback);
};

const normalizeProbabilityRange = (value: unknown, fallback: [number, number]) => {
  if (Array.isArray(value) && value.length >= 2) {
    return [
      normalizeProbability(value[0], fallback[0]),
      normalizeProbability(value[1], fallback[1])
    ] as [number, number];
  }
  return fallback;
};

const normalizeCurrency = (value: unknown, fallback: number) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.round(num));
};

const sanitizeRevenueForecast = (
  value: unknown,
  fallback: RevenueForecast[]
): RevenueForecast[] => {
  if (!Array.isArray(value)) return fallback;
  const normalized = value
    .map((item: any) => ({
      month: Number(item?.month),
      revenue: normalizeCurrency(item?.revenue, 0),
      profit: normalizeCurrency(item?.profit, 0)
    }))
    .filter((item) => Number.isFinite(item.month) && item.month > 0);
  return normalized.length ? normalized : fallback;
};

const sanitizeStringArray = (value: unknown, fallback: string[]) => {
  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    if (normalized.length) {
      return normalized;
    }
  }
  return fallback;
};

const upsertScore = (updated: Score) => {
  const index = scoreStore.findIndex((score) => score.ideaId === updated.ideaId);
  if (index >= 0) {
    scoreStore[index] = updated;
  } else {
    scoreStore.unshift(updated);
  }
};

const resolveVerdict = (
  verdictInput: unknown,
  psf: number,
  pmf: number,
  fallback: Score["verdict"]
): Score["verdict"] => {
  if (verdictInput === "Go" || verdictInput === "Improve" || verdictInput === "Kill") {
    return verdictInput;
  }
  const average = (psf + pmf) / 2;
  if (average >= 75) return "Go";
  if (average <= 45) return "Kill";
  return fallback ?? "Improve";
};
