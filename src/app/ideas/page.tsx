/**
 * @file Ideas index page listing all ideas with a creation form side panel.
 * @remarks Uses the mock API client to mimic server interactions so the UI stays unchanged after backend integration.
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { IdeaForm } from "@/components/forms/IdeaForm";
import { IdeasTable } from "@/components/tables/IdeasTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/apiClient";
import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { Idea, Score } from "@/lib/types";
import { useProjectStore } from "@/store/projectStore";

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const setLoading = useUIStore((state) => state.setLoading);
  const [loading, setLocalLoading] = useState(true);
  const { currentProject, projectLabel } = useProjectStore();
  const currentProjectLabel = projectLabel(currentProject);

  const fetchIdeas = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setLocalLoading(true);
      try {
        const list = await api.listIdeas(currentProject, signal);
        setIdeas(list);
        const scores = await api.getScores(
          list.map((idea) => idea.id),
          signal
        );
        setScores(scores);
      } finally {
        setLoading(false);
        setLocalLoading(false);
      }
    },
    [currentProject, setLoading]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchIdeas(controller.signal);
    return () => controller.abort();
  }, [fetchIdeas]);

  const segments = useMemo(() => Array.from(new Set(ideas.map((idea) => idea.target))), [ideas]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            {t("ideas.title", "案一覧")}（{currentProjectLabel}）
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(
              "ideas.subtitle",
              "仮想ユーザーからの評価データを元に案を整理し、詳細ページで深掘りできます。"
            )}
          </p>
        </div>
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <IdeasTable ideas={ideas} scores={scores} />
        )}
      </section>
      <aside className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {t("ideas.formTitle", "新規案の作成")}
            </CardTitle>
            <CardDescription>
              {t(
                "ideas.formSubtitle",
                "1ファイルのAPI差し替えでシームレスに本番連携できる構造です。"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IdeaForm onCreated={() => fetchIdeas()} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("ideas.segmentSummary", "セグメント構成")}
            </CardTitle>
            <CardDescription>
              {t("ideas.segmentSubtitle", "主要ターゲットの分布を把握します。")}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {segments.map((segment) => (
              <div
                key={segment}
                className="flex items-center justify-between rounded-2xl border border-border px-3 py-2"
              >
                <span>{segment}</span>
                <span className="text-muted-foreground">
                  {ideas.filter((idea) => idea.target === segment).length} {t("ideas.items", "件")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
