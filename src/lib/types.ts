/**
 * @file Central TypeScript definitions shared across the Needs Research App UI.
 * @remarks Keep field names and structures stable to allow backend API responses to align without additional mappings.
 */
export type Project = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Idea = {
  id: string;
  projectId: string;
  version?: string;
  title: string;
  target: string;
  pain: string;
  solution: string;
  price: number;
  channel: string;
  onboarding: string;
  createdAt: string;
  updatedAt: string;
};

export type Score = {
  ideaId: string;
  projectId?: string;
  version?: string;
  psf: number;
  pmf: number;
  ci95: { low: number; high: number };
  p_apply: [number, number];
  p_purchase: [number, number];
  p_d7: [number, number];
  verdict: "Go" | "Improve" | "Kill";
};

export type Contribution = {
  ideaId: string;
  projectId?: string;
  version?: string;
  factors: { name: string; value: number }[];
};

export type PersonaCategory =
  | "大企業決裁者"
  | "VC"
  | "スタートアップ決裁者"
  | "デザイナー"
  | "学生"
  | "主婦";

export type PersonaProfile = {
  id: string;
  name: string;
  category: PersonaCategory;
  age?: number;
  gender?: string;
  background?: string;
  traits?: Record<string, number>;
  comment_style?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PersonaRef = {
  personaId: string;
  slug?: string;
  displayName: string;
  legacyAgentId?: string;
  category?: PersonaCategory | string;
  segment?: string;
};

export type Persona = {
  agent_id: string;
  segment: string;
  traits: {
    novelty: number;
    price_sensitivity: number;
    time_constraint: number;
  };
  constraints?: { budget?: number; time?: number };
  social?: { degree?: number; community?: string };
  projectId?: string;
};

export type Reaction = {
  id: string;
  ideaId: string;
  projectId: string;
  version?: string;
  personaId: string;
  text: string;
  likelihood: number;
  intent_to_try: number;
  createdAt: string;
  segment?: string;
};

export type RagDoc = {
  id: string;
  kind: "review" | "pricing" | "policy" | "trend";
  source: string;
  excerpt: string;
  updatedAt: string;
  projectId?: string;
};

export type SimulationRequest = {
  ideaIds: string[];
  filters?: { segment?: string; traits?: Partial<Persona["traits"]> };
};

export type SimulationPersonaReaction = {
  personaId: string;
  personaName: string;
  category: string;
  comment: string;
  intent_to_try: number;
  price_acceptance: number;
};

export type SimulationResult = {
  ideaId?: string;
  ideaTitle?: string;
  projectId?: string;
  version?: string;
  psf: number;
  pmf: number;
  ci95?: { low: number; high: number };
  personaReactions: SimulationPersonaReaction[];
  summaryComment: string;
};
