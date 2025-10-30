/**
 * @file Simulation page enabling persona-driven scoring for product ideas.
 * @remarks Aggregates GPT reactions across registered personas to surface PSF / PMF insights.
 */
"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/apiClient";
import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { Idea, SimulationResult } from "@/lib/types";
import { formatPercent } from "@/lib/utils";
import { SimulationForm } from "@/components/forms/SimulationForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore } from "@/store/projectStore";

const ResultCard = ({
  result,
  idea
}: {
  result: SimulationResult;
  idea?: Idea;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl">
        {result.ideaTitle ?? idea?.title ?? t("simulate.result.unknown", "未定義の案")}
      </CardTitle>
      <CardDescription>
        {t("simulate.result.segment", "想定セグメント")}: {idea?.target ?? "—"}
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-primary/10 px-4 py-3">
          <p className="text-xs text-muted-foreground">PSF</p>
          <p className="text-2xl font-semibold">{result.psf.toFixed(1)}</p>
        </div>
        <div className="rounded-2xl bg-secondary/20 px-4 py-3">
          <p className="text-xs text-muted-foreground">PMF</p>
          <p className="text-2xl font-semibold">{result.pmf.toFixed(1)}</p>
        </div>
        {result.ci95 ? (
          <div className="sm:col-span-2 rounded-2xl border border-border px-4 py-3 text-sm">
            <p className="text-xs text-muted-foreground">95% CI (PMF)</p>
            <p className="font-medium">
              {result.ci95.low}% — {result.ci95.high}%
            </p>
          </div>
        ) : null}
      </div>
      <p className="rounded-2xl border border-border p-3 text-sm text-muted-foreground">
        {result.summaryComment}
      </p>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("simulate.result.personaHeading", "ペルソナ反応")}
        </p>
        {result.personaReactions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-3 text-xs text-muted-foreground">
            {t("simulate.result.personaEmpty", "登録済みペルソナがありません。/personas から追加してください。")}
          </p>
        ) : (
          <div className="space-y-2">
            {result.personaReactions.map((reaction) => (
              <div
                key={reaction.personaId}
                className="rounded-2xl border border-border/70 bg-card/60 p-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{reaction.personaName}</p>
                    <p className="text-xs text-muted-foreground">{reaction.category}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>
                      意欲: <span className="font-medium">{formatPercent(reaction.intent_to_try)}</span>
                    </p>
                    <p>
                      価格許容:{" "}
                      <span className="font-medium">{formatPercent(reaction.price_acceptance)}</span>
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {reaction.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function SimulatePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const setGlobalLoading = useUIStore((state) => state.setLoading);
  const { currentProject, projectLabel } = useProjectStore();
  const currentProjectLabel = projectLabel(currentProject);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setGlobalLoading(true);
      try {
        const list = await api.listIdeas(currentProject, controller.signal);
        setIdeas(list);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [currentProject, setGlobalLoading]);

  const ideaMap = useMemo(() => new Map(ideas.map((idea) => [idea.id, idea])), [ideas]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
      <section>
        <h1 className="mb-4 text-3xl font-semibold">
          {t("simulate.title", "シミュレーション")}（{currentProjectLabel}）
        </h1>
        {loading ? (
          <Skeleton className="h-[600px] w-full" />
        ) : (
          <SimulationForm ideas={ideas} onSimulated={setResults} />
        )}
      </section>
      <aside className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {t("simulate.resultTitle", "結果サマリ")}
            </CardTitle>
            <CardDescription>
              {t(
                "simulate.resultSubtitle",
                "登録ペルソナの視点からPSF/PMFを再計算し、コメントを集約します。"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {results.length === 0
              ? t("simulate.resultEmpty", "フォームから案を選択してシミュレーションを実行してください。")
              : t("simulate.resultHint", "PSF / PMF とコメントを比較し、注力すべき打ち手を検討しましょう。")}
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {results.map((result, index) => (
            <ResultCard
              key={result.ideaId ?? result.ideaTitle ?? `simulation-${index}`}
              result={result}
              idea={result.ideaId ? ideaMap.get(result.ideaId) : undefined}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}
