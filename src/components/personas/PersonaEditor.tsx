/**
 * @file Persona Editor for crafting rich digital-twin profiles with structured behavioral data.
 */
"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { usePersonaStore } from "@/store/personaStore";

import type { PersonaProfile, PersonaTraitScores } from "@/lib/types";

type PersonaDraft = Omit<PersonaProfile, "id" | "createdAt" | "updatedAt">;

type TraitKey = keyof PersonaTraitScores;

type TraitTagConfig = {
  high: string[];
  mid: string[];
  low: string[];
};

const TRAIT_TAG_DICTIONARY: Record<TraitKey, TraitTagConfig> = {
  innovation_interest: {
    high: ["イノベーティブ", "好奇心旺盛"],
    mid: ["現実志向"],
    low: ["保守的", "安定志向"]
  },
  critical_thinking: {
    high: ["批判的思考", "洞察型"],
    mid: ["バランスタイプ"],
    low: ["素直", "協調的"]
  },
  frugality: {
    high: ["倹約家", "コスト意識高い"],
    mid: ["柔軟な判断"],
    low: ["気前が良い", "体験重視"]
  },
  empathy: {
    high: ["共感型", "サポート志向"],
    mid: ["冷静と共感のバランス"],
    low: ["論理型", "客観派"]
  },
  risk_sensitivity: {
    high: ["慎重派", "堅実志向"],
    mid: ["状況判断型"],
    low: ["挑戦型", "大胆"]
  }
};

const AGE_OPTIONS = ["10代", "20代", "30代", "40代", "50代以上"];
const DECISION_STYLE_OPTIONS = ["直感型", "計画型", "他人に相談する"];

const traitQuestions: Array<{
  key: TraitKey;
  question: string;
  leftLabel: string;
  rightLabel: string;
}> = [
  {
    key: "innovation_interest",
    question: "新しいサービスや技術をどのくらい好みますか？",
    leftLabel: "苦手",
    rightLabel: "大好き"
  },
  {
    key: "critical_thinking",
    question: "物事をどのくらい批判的に考えるタイプですか？",
    leftLabel: "素直",
    rightLabel: "批判的"
  },
  {
    key: "frugality",
    question: "お金を使うことにどのくらい慎重ですか？",
    leftLabel: "気前が良い",
    rightLabel: "倹約的"
  },
  {
    key: "empathy",
    question: "他人にどのくらい共感しますか？",
    leftLabel: "冷静",
    rightLabel: "共感的"
  },
  {
    key: "risk_sensitivity",
    question: "新しいことを始めるとき、どのくらいリスクを気にしますか？",
    leftLabel: "気にしない",
    rightLabel: "とても慎重"
  }
];

const parseList = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const uniqueList = (items: string[]) =>
  Array.from(
    new Set(
      items
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    )
  );

const createInitialDraft = (): PersonaDraft => {
  const traits: PersonaTraitScores = {
    innovation_interest: 3,
    critical_thinking: 3,
    frugality: 3,
    empathy: 3,
    risk_sensitivity: 3
  };
  const draft: PersonaDraft = {
    persona_name: "",
    age_range: AGE_OPTIONS[1] ?? "",
    occupation: "",
    seniority: "",
    location: "",
    role_context: "",
    mission: "",
    decision_authority: "",
    environment: "",
    decision_style: DECISION_STYLE_OPTIONS[0],
    background_summary: "",
    values: [],
    motivations: [],
    success_metrics: [],
    pain_points: [],
    buying_triggers: [],
    objections: [],
    behavior_insights: {
      routines: "",
      research_channels: [],
      tools: [],
      budget_range: "",
      decision_timeframe: ""
    },
    scenario_responses: {
      evaluating_new_solution: "",
      approval_process: "",
      risk_mitigation: ""
    },
    network: {
      communities: [],
      influencers: [],
      decision_partners: []
    },
    future_outlook: "",
    traits,
    personality_tags: []
  };
  return {
    ...draft,
    personality_tags: generatePersonalityTags(traits)
  };
};

type PersonaStringField =
  | "persona_name"
  | "age_range"
  | "occupation"
  | "seniority"
  | "location"
  | "role_context"
  | "mission"
  | "decision_authority"
  | "environment"
  | "decision_style"
  | "background_summary"
  | "future_outlook";

type TopLevelListField =
  | "values"
  | "motivations"
  | "success_metrics"
  | "pain_points"
  | "buying_triggers"
  | "objections";

type BehaviorStringField = "routines" | "budget_range" | "decision_timeframe";
type BehaviorListField = "research_channels" | "tools";
type ScenarioField = "evaluating_new_solution" | "approval_process" | "risk_mitigation";
type NetworkListField = "communities" | "influencers" | "decision_partners";

export const generatePersonalityTags = (traits: PersonaTraitScores): string[] => {
  const selected = new Set<string>();
  const fallbacks: string[] = [];

  (Object.keys(traits) as TraitKey[]).forEach((key) => {
    const value = traits[key];
    const config = TRAIT_TAG_DICTIONARY[key];
    if (!config) return;

    if (value >= 4) {
      selected.add(config.high[0]);
      fallbacks.push(...config.high.slice(1));
    } else if (value <= 2) {
      selected.add(config.low[0]);
      fallbacks.push(...config.low.slice(1));
    } else {
      fallbacks.push(...config.mid);
    }
  });

  const ordered = Array.from(selected);

  for (const tag of fallbacks) {
    if (ordered.length >= 5) break;
    if (!ordered.includes(tag)) {
      ordered.push(tag);
    }
  }

  if (ordered.length < 3) {
    const neutralPool = Object.values(TRAIT_TAG_DICTIONARY)
      .flatMap((config) => config.mid)
      .filter(Boolean);
    for (const neutral of neutralPool) {
      if (ordered.length >= 3) break;
      if (!ordered.includes(neutral)) {
        ordered.push(neutral);
      }
    }
  }

  return ordered.slice(0, 5);
};

type PersonaEditorProps = {
  showHeader?: boolean;
  className?: string;
};

export const PersonaEditor = ({ showHeader = true, className }: PersonaEditorProps) => {
  const [persona, setPersona] = useState<PersonaDraft>(createInitialDraft);
  const [saving, setSaving] = useState(false);
  const createPersona = usePersonaStore((state) => state.createPersona);
  const setToast = useUIStore((state) => state.setToast);

  useEffect(() => {
    setPersona((previous) => ({
      ...previous,
      personality_tags:
        previous.personality_tags.length > 0
          ? previous.personality_tags
          : generatePersonalityTags(previous.traits)
    }));
  }, []);

  const handleStringFieldChange =
    (field: PersonaStringField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setPersona((previous) => ({
        ...previous,
        [field]: value
      }));
    };

  const handleTopLevelListChange = (field: TopLevelListField) => (value: string) => {
    setPersona((previous) => ({
      ...previous,
      [field]: parseList(value)
    }));
  };

  const handleBehaviorStringChange = (field: BehaviorStringField) => (value: string) => {
    setPersona((previous) => ({
      ...previous,
      behavior_insights: {
        ...previous.behavior_insights,
        [field]: value
      }
    }));
  };

  const handleBehaviorListChange = (field: BehaviorListField) => (value: string) => {
    setPersona((previous) => ({
      ...previous,
      behavior_insights: {
        ...previous.behavior_insights,
        [field]: parseList(value)
      }
    }));
  };

  const handleScenarioChange = (field: ScenarioField) => (value: string) => {
    setPersona((previous) => ({
      ...previous,
      scenario_responses: {
        ...previous.scenario_responses,
        [field]: value
      }
    }));
  };

  const handleNetworkListChange = (field: NetworkListField) => (value: string) => {
    setPersona((previous) => ({
      ...previous,
      network: {
        ...previous.network,
        [field]: parseList(value)
      }
    }));
  };

  const handleTraitChange = (trait: TraitKey) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setPersona((previous) => {
      const updatedTraits = { ...previous.traits, [trait]: value };
      return {
        ...previous,
        traits: updatedTraits,
        personality_tags:
          previous.personality_tags.length > 0
            ? generatePersonalityTags(updatedTraits)
            : previous.personality_tags
      };
    });
  };

  const regenerateTags = () => {
    setPersona((previous) => ({
      ...previous,
      personality_tags: generatePersonalityTags(previous.traits)
    }));
  };

  const handleSave = async () => {
    if (!persona.persona_name.trim() || !persona.occupation.trim()) {
      setToast({
        tone: "error",
        message: "名前と職業を入力してください。"
      });
      return;
    }

    setSaving(true);
    const normalize = (value?: string) => {
      const trimmed = value?.trim();
      return trimmed && trimmed.length > 0 ? trimmed : undefined;
    };

    try {
      const payload: PersonaDraft = {
        ...persona,
        persona_name: persona.persona_name.trim(),
        occupation: persona.occupation.trim(),
        seniority: normalize(persona.seniority),
        location: normalize(persona.location),
        role_context: normalize(persona.role_context),
        mission: normalize(persona.mission),
        decision_authority: normalize(persona.decision_authority),
        environment: normalize(persona.environment),
        decision_style: persona.decision_style,
        background_summary: normalize(persona.background_summary),
        values: uniqueList(persona.values),
        motivations: uniqueList(persona.motivations),
        success_metrics: uniqueList(persona.success_metrics),
        pain_points: uniqueList(persona.pain_points),
        buying_triggers: uniqueList(persona.buying_triggers),
        objections: uniqueList(persona.objections),
        behavior_insights: {
          routines: normalize(persona.behavior_insights.routines),
          research_channels: uniqueList(persona.behavior_insights.research_channels),
          tools: uniqueList(persona.behavior_insights.tools),
          budget_range: normalize(persona.behavior_insights.budget_range),
          decision_timeframe: normalize(persona.behavior_insights.decision_timeframe)
        },
        scenario_responses: {
          evaluating_new_solution: normalize(persona.scenario_responses.evaluating_new_solution),
          approval_process: normalize(persona.scenario_responses.approval_process),
          risk_mitigation: normalize(persona.scenario_responses.risk_mitigation)
        },
        network: {
          communities: uniqueList(persona.network.communities),
          influencers: uniqueList(persona.network.influencers),
          decision_partners: uniqueList(persona.network.decision_partners)
        },
        future_outlook: normalize(persona.future_outlook),
        personality_tags:
          persona.personality_tags.length > 0
            ? uniqueList(persona.personality_tags)
            : generatePersonalityTags(persona.traits)
      };

      const savedPersona = await createPersona(payload);
      if (!savedPersona) {
        setToast({ tone: "error", message: "ペルソナの登録に失敗しました。" });
        return;
      }
      setToast({ tone: "success", message: `${payload.persona_name} を登録しました。` });
      setPersona(createInitialDraft());
    } catch (error) {
      console.error(error);
      setToast({ tone: "error", message: "ペルソナの登録中にエラーが発生しました。" });
    } finally {
      setSaving(false);
    }
  };

  const jsonPreview = useMemo(
    () =>
      JSON.stringify(
        {
          ...persona,
          personality_tags: persona.personality_tags
        },
        null,
        2
      ),
    [persona]
  );

  const topLevelListConfig: Array<{
    key: TopLevelListField;
    label: string;
    placeholder: string;
  }> = [
    {
      key: "values",
      label: "価値観（1行1要素）",
      placeholder: "成長と挑戦\n透明性\n自律性"
    },
    {
      key: "motivations",
      label: "モチベーション",
      placeholder: "市場をリードしたい\nチームの成功\n社会的意義"
    },
    {
      key: "success_metrics",
      label: "成功を測る指標",
      placeholder: "ARR成長率\n顧客継続率\nNPS"
    },
    {
      key: "pain_points",
      label: "現在の課題",
      placeholder: "導入時の教育コスト\n社内調整の複雑さ"
    },
    {
      key: "buying_triggers",
      label: "導入を後押しする要素",
      placeholder: "ROIが明確\n成功事例\n導入サポート"
    },
    {
      key: "objections",
      label: "想定される懸念・反論",
      placeholder: "セキュリティの懸念\n予算不足\n既存プロセスとの齟齬"
    }
  ];

  return (
    <section className={cn("space-y-6", className)}>
      {showHeader && (
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">ペルソナ作成</h1>
          <p className="text-sm text-muted-foreground">
            属性・文脈・思考傾向まで詳細に入力してデジタルツインを構築します。
          </p>
        </header>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold">基本プロフィール</h2>
              <p className="text-sm text-muted-foreground">
                組織内での立場や属性を整理し、ペルソナの基礎情報を定義します。
              </p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="persona-name">名前</Label>
                  <Input
                    id="persona-name"
                    placeholder="例：坂本 海斗"
                    value={persona.persona_name}
                    onChange={handleStringFieldChange("persona_name")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age-range">年齢層</Label>
                  <Select
                    id="age-range"
                    value={persona.age_range}
                    onChange={handleStringFieldChange("age_range")}
                    required
                  >
                    {AGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="occupation">職業</Label>
                  <Input
                    id="occupation"
                    placeholder="例：スタートアップCOO"
                    value={persona.occupation}
                    onChange={handleStringFieldChange("occupation")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seniority">役職・レベル</Label>
                  <Input
                    id="seniority"
                    placeholder="例：経営層 / マネージャー / IC"
                    value={persona.seniority ?? ""}
                    onChange={handleStringFieldChange("seniority")}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">勤務地・生活拠点</Label>
                  <Input
                    id="location"
                    placeholder="例：東京都 / リモートワーク中心"
                    value={persona.location ?? ""}
                    onChange={handleStringFieldChange("location")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">勤務環境・所属</Label>
                  <Input
                    id="environment"
                    placeholder="例：SaaSスタートアップ / 150名規模"
                    value={persona.environment ?? ""}
                    onChange={handleStringFieldChange("environment")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-context">職務・役割の文脈</Label>
                <Textarea
                  id="role-context"
                  rows={3}
                  placeholder="例：営業・CS部門を横断管理し、ARR成長を担う。"
                  value={persona.role_context ?? ""}
                  onChange={(event) => handleStringFieldChange("role_context")(event)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="decision-style">意思決定スタイル</Label>
                  <Select
                    id="decision-style"
                    value={persona.decision_style ?? DECISION_STYLE_OPTIONS[0]}
                    onChange={handleStringFieldChange("decision_style")}
                  >
                    {DECISION_STYLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decision-authority">意思決定権限</Label>
                  <Input
                    id="decision-authority"
                    placeholder="例：1000万円まで単独決裁"
                    value={persona.decision_authority ?? ""}
                    onChange={handleStringFieldChange("decision_authority")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission">ミッション・KPI</Label>
                <Textarea
                  id="mission"
                  rows={2}
                  placeholder="例：ARRを倍増させるための仕組みづくりと組織スケール。"
                  value={persona.mission ?? ""}
                  onChange={(event) => handleStringFieldChange("mission")(event)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="background-summary">経歴・背景</Label>
                <Textarea
                  id="background-summary"
                  rows={3}
                  placeholder="例：コンサル出身。2社目のスタートアップを支援し、データドリブンな経営を推進。"
                  value={persona.background_summary ?? ""}
                  onChange={(event) => handleStringFieldChange("background_summary")(event)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold">価値観・モチベーション・評価軸</h2>
              <p className="text-sm text-muted-foreground">
                ペルソナが何を大切にし、どのように成果を測るのかを定義します。1行につき1項目で入力してください。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {topLevelListConfig.map((config) => (
                <div key={config.key} className="space-y-2">
                  <Label>{config.label}</Label>
                  <Textarea
                    rows={config.key === "values" ? 3 : 4}
                    value={persona[config.key].join("\n")}
                    placeholder={config.placeholder}
                    onChange={(event) => handleTopLevelListChange(config.key)(event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold">意思決定プロセスと購買行動</h2>
              <p className="text-sm text-muted-foreground">
                情報収集・意思決定の流れや、利用ツール・予算感などの具体的な行動特性を入力します。
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="routines">日常のルーティン</Label>
                <Textarea
                  id="routines"
                  rows={3}
                  placeholder="例：毎朝主要指標を確認し、週末は業界イベントに参加。"
                  value={persona.behavior_insights.routines ?? ""}
                  onChange={(event) => handleBehaviorStringChange("routines")(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>情報収集チャネル（1行1つ）</Label>
                <Textarea
                  rows={3}
                  placeholder="例：TechCrunch Japan\nLinkedIn\nCircleコミュニティ"
                  value={persona.behavior_insights.research_channels.join("\n")}
                  onChange={(event) =>
                    handleBehaviorListChange("research_channels")(event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>利用ツール・サービス（1行1つ）</Label>
                <Textarea
                  rows={3}
                  placeholder="例：Notion\nAsana\nLooker"
                  value={persona.behavior_insights.tools.join("\n")}
                  onChange={(event) => handleBehaviorListChange("tools")(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget-range">予算レンジ</Label>
                <Input
                  id="budget-range"
                  placeholder="例：月額50〜120万円"
                  value={persona.behavior_insights.budget_range ?? ""}
                  onChange={(event) => handleBehaviorStringChange("budget_range")(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="decision-timeframe">意思決定リードタイム</Label>
                <Input
                  id="decision-timeframe"
                  placeholder="例：2〜3ヶ月で導入判断"
                  value={persona.behavior_insights.decision_timeframe ?? ""}
                  onChange={(event) =>
                    handleBehaviorStringChange("decision_timeframe")(event.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold">シナリオ・ネットワーク・将来展望</h2>
              <p className="text-sm text-muted-foreground">
                具体的なシーンでの反応や、意思決定に影響するネットワーク、将来展望を記録します。
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>新規ソリューションに触れたとき</Label>
                <Textarea
                  rows={3}
                  placeholder="例：ROIシミュレーションと既存プロセスを照合して評価。"
                  value={persona.scenario_responses.evaluating_new_solution ?? ""}
                  onChange={(event) =>
                    handleScenarioChange("evaluating_new_solution")(event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>社内承認プロセス</Label>
                <Textarea
                  rows={3}
                  placeholder="例：CEOと財務責任者の合意を2週間以内に取得。"
                  value={persona.scenario_responses.approval_process ?? ""}
                  onChange={(event) => handleScenarioChange("approval_process")(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>リスク発生時の対応</Label>
                <Textarea
                  rows={3}
                  placeholder="例：スモールスタートで検証し、指標を見て全社展開を判断。"
                  value={persona.scenario_responses.risk_mitigation ?? ""}
                  onChange={(event) => handleScenarioChange("risk_mitigation")(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>所属コミュニティ（1行1つ）</Label>
                <Textarea
                  rows={3}
                  placeholder="例：SaaS Leaders Japan\nB Dash Camp"
                  value={persona.network.communities.join("\n")}
                  onChange={(event) => handleNetworkListChange("communities")(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>影響を受ける人物・インフルエンサー（1行1つ）</Label>
                <Textarea
                  rows={3}
                  placeholder="例：業界アドバイザー（元COO）\nVCパートナー"
                  value={persona.network.influencers.join("\n")}
                  onChange={(event) => handleNetworkListChange("influencers")(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>意思決定に関わるメンバー（1行1つ）</Label>
                <Textarea
                  rows={3}
                  placeholder="例：CEO\nVP of Sales\nFinance Manager"
                  value={persona.network.decision_partners.join("\n")}
                  onChange={(event) =>
                    handleNetworkListChange("decision_partners")(event.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="future-outlook">将来の展望・環境変化</Label>
              <Textarea
                id="future-outlook"
                rows={3}
                placeholder="例：海外展開やAI導入による意思決定自動化を検討。"
                value={persona.future_outlook ?? ""}
                onChange={(event) => handleStringFieldChange("future_outlook")(event)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold">性格・思考傾向</h2>
              <p className="text-sm text-muted-foreground">
                スライダーで主要指標を調整し、性格タグを自動生成します。
              </p>
            </div>
            <div className="space-y-6">
              {traitQuestions.map((trait) => (
                <div key={trait.key} className="space-y-2 rounded-xl bg-background/50 p-3">
                  <div className="flex items-start justify-between gap-4">
                    <Label htmlFor={trait.key} className="font-medium">
                      {trait.question}
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {persona.traits[trait.key]}
                    </span>
                  </div>
                  <div className="flex w-full flex-col gap-2">
                    <input
                      id={trait.key}
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={persona.traits[trait.key]}
                      onChange={handleTraitChange(trait.key)}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-primary/20"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{trait.leftLabel}</span>
                      <span>{trait.rightLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" onClick={regenerateTags} variant="secondary">
                性格タグを生成
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? "登録中..." : "ペルソナを登録"}
              </Button>
            </div>

            <div className="rounded-xl bg-background/60 p-3">
              <p className="text-xs font-medium text-muted-foreground">タグプレビュー</p>
              {persona.personality_tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {persona.personality_tags.map((tag) => (
                    <Badge key={`inline-${tag}`} variant="soft" className="rounded-full px-3 py-1 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  「性格タグを生成」を押すとタグがここに表示されます。
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold">JSONプレビュー</h2>
            <p className="text-sm text-muted-foreground">
              入力内容を保存形式そのままで確認できます。右クリックでコピーしてください。
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">性格タグ</Label>
            {persona.personality_tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {persona.personality_tags.map((tag) => (
                  <Badge key={tag} variant="soft" className="rounded-full px-3 py-1 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                スライダーを調整し「性格タグを生成」を押すとタグが表示されます。
              </p>
            )}
          </div>
          <pre className="max-h-[520px] overflow-auto rounded-xl bg-background/80 p-4 text-xs leading-relaxed">
            {jsonPreview}
          </pre>
        </aside>
      </div>
    </section>
  );
};

export default PersonaEditor;
