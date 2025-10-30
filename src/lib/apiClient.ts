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
import {
  Contribution,
  Idea,
  Persona,
  PersonaProfile,
  Project,
  RagDoc,
  Reaction,
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
    signal?: AbortSignal
  ): Promise<SimulationResult[]> {
    const baseUrl = getApiBaseUrl();
    if (baseUrl) {
      const response = await fetch(`${baseUrl}/simulate`, {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.detail ?? "シミュレーションの取得に失敗しました");
      }
      return payload as SimulationResult[];
    }

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const fallbackPersonas =
      personaRegistryStore.length > 0
        ? personaRegistryStore
        : [
            {
              id: "persona-demo-a",
              name: "モック学生A",
              category: "学生",
              comment_style: "フレンドリー"
            },
            {
              id: "persona-demo-b",
              name: "モック決裁者B",
              category: "スタートアップ決裁者",
              comment_style: "冷静分析型"
            }
          ];

    const baseResults = req.ideaIds.map((id, index) => {
      const baseScore = findScore(id);
      const idea = ideaStore.find((entry) => entry.id === id);
      const personas = fallbackPersonas.slice(0, Math.min(3, fallbackPersonas.length));
      const personaReactions: SimulationPersonaReaction[] = personas.map((persona, personaIndex) => {
        const intentBase = clamp(baseScore.p_apply[1] - 0.06 + personaIndex * 0.05);
        const priceBase = clamp(baseScore.p_purchase[1] - 0.04 + personaIndex * 0.04);
        const tone = persona.comment_style ?? "中立";
        const subject = idea?.title ?? "この案";
        const comment =
          tone === "冷静分析型"
            ? `${persona.name}は ${subject} をROI視点で慎重に評価しています。導入負荷を明確にできれば検討余地があります。`
            : `${persona.name}は ${subject} に好感を持っていますが、価格感度にも配慮したいと考えています。`;
        return {
          personaId: persona.id,
          personaName: persona.name,
          category: persona.category,
          comment,
          intent_to_try: Number(intentBase.toFixed(3)),
          price_acceptance: Number(priceBase.toFixed(3))
        };
      });

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
        ideaId: id,
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
    return simulateNetwork(baseResults, signal);
  }
};
