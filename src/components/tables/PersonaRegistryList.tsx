/**
 * @file Presentation component for the registered persona catalog.
 * @remarks Designed as simple cards so we can later extend to inline editing or detail drawers.
 */
"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { PersonaProfile } from "@/lib/types";

const PersonaListBlock = ({ title, items }: { title: string; items: string[] }) => {
  if (!items.length) return null;
  return (
    <div className="space-y-1 rounded-xl bg-muted/30 p-3">
      <p className="text-xs font-semibold text-muted-foreground">{title}</p>
      <ul className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {items.map((item) => (
          <li key={`${title}-${item}`} className="rounded-full bg-background px-3 py-1">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const PersonaInlineList = ({ label, items }: { label: string; items: string[] }) => {
  if (items.length === 0) return null;
  return (
    <p>
      <span className="font-semibold text-muted-foreground/90">{label}：</span>
      <span className="text-muted-foreground">{items.join(" / ")}</span>
    </p>
  );
};

type PersonaRegistryListProps = {
  personas: PersonaProfile[];
  loading?: boolean;
};

export const PersonaRegistryList = ({ personas, loading }: PersonaRegistryListProps) => {
  if (loading) {
    return <p className="text-sm text-muted-foreground">ペルソナを読み込み中です…</p>;
  }

  if (!personas.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        登録済みのペルソナはまだありません。フォームから最初のペルソナを追加してください。
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {personas.map((persona, index) => {
        const behavior = persona.behavior_insights ?? {
          routines: "",
          research_channels: [],
          tools: [],
          budget_range: "",
          decision_timeframe: ""
        };
        const scenarios = persona.scenario_responses ?? {
          evaluating_new_solution: "",
          approval_process: "",
          risk_mitigation: ""
        };
        const network = persona.network ?? {
          communities: [],
          influencers: [],
          decision_partners: []
        };
        return (
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
          <Card className="h-full rounded-2xl border-border/70 shadow-lg">
            <CardHeader className="space-y-3 pb-3">
              <CardTitle className="text-lg font-semibold">{persona.persona_name}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="soft" className="rounded-full px-3 py-1 text-xs">
                  {persona.age_range}
                </Badge>
                <Badge variant="soft" className="rounded-full px-3 py-1 text-xs">
                  {persona.occupation}
                </Badge>
                {persona.seniority ? (
                  <Badge variant="soft" className="rounded-full px-3 py-1 text-xs">
                    {persona.seniority}
                  </Badge>
                ) : null}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {persona.location && <p>拠点：{persona.location}</p>}
                {persona.environment && <p>環境：{persona.environment}</p>}
                {persona.mission && <p>ミッション：{persona.mission}</p>}
                {persona.decision_authority && <p>権限：{persona.decision_authority}</p>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {persona.personality_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {persona.personality_tags.map((tag) => (
                    <Badge key={`${persona.id}-${tag}`} variant="soft" className="rounded-full px-3 py-1 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {persona.background_summary && (
                <p className="rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                  {persona.background_summary}
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <PersonaListBlock title="価値観" items={persona.values} />
                <PersonaListBlock title="モチベーション" items={persona.motivations} />
                <PersonaListBlock title="成功指標" items={persona.success_metrics} />
                <PersonaListBlock title="課題" items={persona.pain_points} />
                <PersonaListBlock title="導入トリガー" items={persona.buying_triggers} />
                <PersonaListBlock title="想定される懸念" items={persona.objections} />
              </div>

              <div className="space-y-3 rounded-2xl border border-border/60 p-3 text-xs text-muted-foreground">
                {behavior.routines && <p>日常：{behavior.routines}</p>}
                <PersonaInlineList label="情報チャネル" items={behavior.research_channels} />
                <PersonaInlineList label="利用ツール" items={behavior.tools} />
                {behavior.budget_range && <p>予算レンジ：{behavior.budget_range}</p>}
                {behavior.decision_timeframe && (
                  <p>意思決定リードタイム：{behavior.decision_timeframe}</p>
                )}
              </div>

              <div className="space-y-3 text-xs text-muted-foreground">
                <PersonaInlineList
                  label="新規ソリューション評価"
                  items={scenarios.evaluating_new_solution ? [scenarios.evaluating_new_solution] : []}
                />
                <PersonaInlineList
                  label="承認プロセス"
                  items={scenarios.approval_process ? [scenarios.approval_process] : []}
                />
                <PersonaInlineList
                  label="リスク対応"
                  items={scenarios.risk_mitigation ? [scenarios.risk_mitigation] : []}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <PersonaListBlock title="所属コミュニティ" items={network.communities} />
                <PersonaListBlock title="影響を受ける人物" items={network.influencers} />
                <PersonaListBlock title="意思決定パートナー" items={network.decision_partners} />
              </div>

              {persona.future_outlook && (
                <p className="rounded-xl bg-background/50 p-3 text-xs leading-relaxed text-muted-foreground">
                  将来展望：{persona.future_outlook}
                </p>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Traits
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(persona.traits).map(([trait, value]) => (
                    <li
                      key={trait}
                      className="flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2 text-xs font-medium text-primary"
                    >
                      <span>{trait}</span>
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        );
      })}
    </div>
  );
};
