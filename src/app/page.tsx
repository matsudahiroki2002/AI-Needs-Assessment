/**
 * @file Dashboard page aggregating PSF/PMF signals, key metrics, and recent reactions.
 * @remarks This page intentionally calls the mock API client so the eventual backend swap only replaces the underlying data source.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Cpu, RefreshCw } from "lucide-react";

import { api } from "@/lib/apiClient";
import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { Contribution, Idea, Reaction, Score } from "@/lib/types";
import { formatPercentRange } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";
import FactorContributionCard from "@/components/cards/FactorContributionCard";
import { PsfPmfCard } from "@/components/cards/PsfPmfCard";
import TrendSparkline from "@/components/charts/TrendSparkline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

type MetricCardProps = {
  label: string;
  value: string;
  sublabel: string;
  trend: Array<{ label: string; value: number }>;
};

const MetricCard = ({ label, value, sublabel, trend }: MetricCardProps) => (
  <Card className="shadow-card">
    <CardHeader className="gap-1">
      <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
        {label}
      </CardTitle>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <CardDescription>{sublabel}</CardDescription>
    </CardHeader>
    <CardContent>
      <TrendSparkline data={trend} />
    </CardContent>
  </Card>
);

const ReactionsPanel = ({ reactions }: { reactions: Reaction[] }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="text-xl">
          {t("dashboard.reactionsTitle", "擬似反応サマリ")}
        </CardTitle>
        <CardDescription>
          {t(
            "dashboard.reactionsSubtitle",
            "最新のフィードバックとセグメントを参照し、次の検証ポイントを検討します。"
          )}
        </CardDescription>
      </div>
      <Badge variant="outline">
        {t("dashboard.reactionsCount", "{{count}}件", { count: reactions.length })}
      </Badge>
    </CardHeader>
    <CardContent className="grid gap-4">
      {reactions.map((reaction) => (
        <div key={reaction.id} className="flex flex-col gap-2 rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="soft">{reaction.segment ?? t("reactions.unknown", "不明")}</Badge>
            <span>{reaction.personaId}</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{reaction.text}</p>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>{t("dashboard.likelihood", "受容確率")}: {Math.round(reaction.likelihood * 100)}%</span>
            <span>{t("dashboard.intent", "意欲")}: {Math.round(reaction.intent_to_try * 100)}%</span>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

const MERGED_METRICS = ["p_apply", "p_purchase", "p_d7"] as const;

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const setLoading = useUIStore((state) => state.setLoading);
  const [loading, setLocalLoading] = useState(true);
  const [syntheticOnly, setSyntheticOnly] = useState(true);
  const { currentProject, projectLabel } = useProjectStore();
  const currentProjectLabel = projectLabel(currentProject);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setLocalLoading(true);
      try {
        const ideaList = await api.listIdeas(currentProject, controller.signal);
        if (!mounted) return;
        setIdeas(ideaList);
        const scoreList = await api.getScores(
          ideaList.map((idea) => idea.id),
          controller.signal
        );
        if (!mounted) return;
        setScores(scoreList);
        if (ideaList[0]) {
          const contributionData = await api.getContributions(
            ideaList[0].id,
            controller.signal
          );
          if (!mounted) return;
          setContribution(contributionData);
        }
        const reactionPrompts = await Promise.all(
          ideaList.map((idea) =>
            api.getReactions(idea.id, { page: 1 }, controller.signal)
          )
        );
        if (!mounted) return;
        const merged = reactionPrompts.flatMap((item) => item.reactions);
        merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setReactions(merged.slice(0, 10));
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
          setLocalLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [currentProject, setLoading]);

  const metrics = useMemo(() => {
    if (scores.length === 0) return [];
    return MERGED_METRICS.map((metricKey) => {
      const range = [
        Math.min(...scores.map((score) => score[metricKey][0])),
        Math.max(...scores.map((score) => score[metricKey][1]))
      ] as [number, number];
      const trend = scores.map((score, index) => ({
        label: `${index + 1}`,
        value: Math.round(score[metricKey][1] * 100)
      }));
      return {
        label: t(`dashboard.metric.${metricKey}`, metricKey),
        value: formatPercentRange(range),
        sublabel: t("dashboard.metricRange", "現状の想定レンジ"),
        trend
      };
    });
  }, [scores]);

  const skeleton = (
    <div className="grid gap-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold">
            {t("dashboard.title", "ニーズ検証ダッシュボード")}（{currentProjectLabel}）
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(
              "dashboard.subtitle",
              "仮想ユーザーの評価と最新の指標を確認し、PSF/PMFの進捗を俯瞰します。"
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2">
          <Cpu className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">
            {t("dashboard.syntheticToggle", "合成データ表示")}
          </span>
          <Switch
            checked={syntheticOnly}
            onChange={(event) => setSyntheticOnly(event.target.checked)}
            aria-label={t("dashboard.syntheticToggleLabel", "合成/実測データの切替")}
          />
          <span className="text-xs text-muted-foreground">
            {syntheticOnly ? t("dashboard.mode.synthetic", "合成のみ") : t("dashboard.mode.blend", "合成 + 実測")}
          </span>
        </div>
      </section>

      {loading ? (
        skeleton
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-3">
            {scores.map((score) => {
              const idea = ideas.find((item) => item.id === score.ideaId);
              return (
                <div key={score.ideaId} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                      {idea?.title}
                    </h2>
                    {idea?.version ? <Badge variant="outline">Ver {idea.version}</Badge> : null}
                  </div>
                  <PsfPmfCard score={score} />
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            {contribution ? (
              <FactorContributionCard contribution={contribution} />
            ) : (
              <Skeleton className="h-80 w-full" />
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {t("dashboard.actionTitle", "次アクション候補")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.actionSubtitle", "スコア改善に向けた優先アクションを整理します。")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div className="rounded-2xl border border-border p-4">
                  <p className="font-medium">{t("dashboard.action.iterate", "獲得チャネルの細分化")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "dashboard.action.iterate.body",
                      "価格帯別にクリエイティブをテストし、仮想ユーザーからの反応差分をログに残します。"
                    )}
                  </p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="font-medium">{t("dashboard.action.timing", "オンボーディング体験短縮")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "dashboard.action.timing.body",
                      "初回導入の手順を3ステップに再構成し、継続率の変化を追跡します。"
                    )}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="self-start">
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t("dashboard.action.refresh", "提案を更新")}
                </Button>
              </CardContent>
            </Card>
          </section>

          <section>
            <ReactionsPanel reactions={reactions} />
          </section>
        </>
      )}
    </div>
  );
}
