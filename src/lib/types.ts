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

export type RevenueForecast = {
  month: number;
  revenue: number;
  profit: number;
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
  ltv: number;
  revenue_forecast: RevenueForecast[];
  improvement_suggestions: string[];
  verdict: "Go" | "Improve" | "Kill";
};

export type Contribution = {
  ideaId: string;
  projectId?: string;
  version?: string;
  factors: { name: string; value: number }[];
};

export type PersonaTraitScores = {
  innovation_interest: number;
  critical_thinking: number;
  frugality: number;
  empathy: number;
  risk_sensitivity: number;
};

export type PersonaProfile = {
  id: string;
  persona_name: string;
  age_range: string;
  occupation: string;
  seniority?: string;
  location?: string;
  role_context?: string;
  mission?: string;
  decision_authority?: string;
  environment?: string;
  decision_style?: string;
  background_summary?: string;
  values: string[];
  motivations: string[];
  success_metrics: string[];
  pain_points: string[];
  buying_triggers: string[];
  objections: string[];
  behavior_insights: {
    routines?: string;
    research_channels: string[];
    tools: string[];
    budget_range?: string;
    decision_timeframe?: string;
  };
  scenario_responses: {
    evaluating_new_solution?: string;
    approval_process?: string;
    risk_mitigation?: string;
  };
  network: {
    communities: string[];
    influencers: string[];
    decision_partners: string[];
  };
  future_outlook?: string;
  traits: PersonaTraitScores;
  personality_tags: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type PersonaRef = {
  personaId: string;
  slug?: string;
  displayName: string;
  legacyAgentId?: string;
  category?: string;
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

export type SimulationResponsePayload = {
  results: SimulationResult[];
  updatedScores: Score[];
};
