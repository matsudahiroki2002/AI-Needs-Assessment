/**
 * @file Simulation page enabling A/B/C comparisons for ideas.
 * @remarks Keeps business logic minimal to allow backend models to plug in with identical payloads.
 */
"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/apiClient";
import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { Idea, SimulationResult } from "@/lib/types";
import { formatPercentRange } from "@/lib/utils";
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
        {idea?.title ?? t("simulate.result.unknown", "未定義の案")}
      </CardTitle>
      <CardDescription>
        {t("simulate.result.segment", "想定セグメント")}: {idea?.target ?? "—"}
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-3">
      <div className="flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {t("simulate.result.winProb", "勝率")}
        </span>
        <span className="text-2xl font-semibold">
          {Math.round((result.winProb ?? 0) * 100)}%
        </span>
      </div>
      <div className="grid gap-2 text-sm">
        <div className="rounded-2xl border border-border p-3">
          <p className="text-xs text-muted-foreground">
            {t("simulate.result.apply", "P(申込)")}
          </p>
          <p className="font-medium">{formatPercentRange(result.ranges.p_apply)}</p>
        </div>
        <div className="rounded-2xl border border-border p-3">
          <p className="text-xs text-muted-foreground">
            {t("simulate.result.purchase", "P(購入)")}
          </p>
          <p className="font-medium">{formatPercentRange(result.ranges.p_purchase)}</p>
        </div>
        <div className="rounded-2xl border border-border p-3">
          <p className="text-xs text-muted-foreground">
            {t("simulate.result.d7", "P(D7)")}
          </p>
          <p className="font-medium">{formatPercentRange(result.ranges.p_d7)}</p>
        </div>
      </div>
      <p className="rounded-2xl border border-border p-3 text-sm text-muted-foreground">
        {result.summary}
      </p>
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
                "仮想セグメントでの勝率とKPIレンジをダミー演算で提示します。"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {results.length === 0
              ? t("simulate.resultEmpty", "フォームから案を選択してシミュレーションを実行してください。")
              : t("simulate.resultHint", "カードを並べてA/B/Cの勝率差を比較できます。")}
          </CardContent>
        </Card>
        <div className="grid gap-4">
          {results.map((result) => (
            <ResultCard key={result.ideaId} result={result} idea={ideaMap.get(result.ideaId)} />
          ))}
        </div>
      </aside>
    </div>
  );
}
