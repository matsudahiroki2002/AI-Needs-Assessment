/**
 * @file Reports page offering printable summary cards per idea.
 * @remarks The export action uses window.print today and will evolve into server-side PDF generation later.
 */
"use client";

import { FileDown, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import RevenueForecastChart from "@/components/charts/RevenueForecastChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/apiClient";
import { t } from "@/lib/i18n";
import { Idea, Contribution, Score } from "@/lib/types";
import { formatCurrency, formatDate, verdictTone } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";

type ReportItem = {
  idea: Idea;
  score: Score;
  contribution?: Contribution;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentProject, projectLabel } = useProjectStore();
  const currentProjectLabel = projectLabel(currentProject);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const ideaList = await api.listIdeas(currentProject, controller.signal);
        const scores = await api.getScores(
          ideaList.map((idea) => idea.id),
          controller.signal
        );
        const contributions = await Promise.all(
          ideaList.map((idea) => api.getContributions(idea.id, controller.signal))
        );
        const reportItems: ReportItem[] = ideaList.map((idea) => ({
          idea,
          score: scores.find((score) => score.ideaId === idea.id)!,
          contribution: contributions.find((item) => item.ideaId === idea.id)
        }));
        setReports(reportItems);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [currentProject]);

  const handlePrint = () => {
    // TODO(a11y): Replace with accessible modal confirmation when export workflow becomes richer.
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const totalIdeas = useMemo(() => reports.length, [reports]);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            {t("reports.title", "レポート生成")}（{currentProjectLabel}）
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(
              "reports.subtitle",
              "カードを印刷してMVPの成果を共有できます。将来的にはPDF出力へ拡張予定です。"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<FileDown className="h-4 w-4" aria-hidden="true" />} onClick={handlePrint}>
            {t("reports.exportPrint", "印刷ビュー")}
          </Button>
          <Button variant="default" icon={<Printer className="h-4 w-4" aria-hidden="true" />} onClick={handlePrint}>
            {t("reports.callToAction", "レポートを印刷")}
          </Button>
        </div>
      </section>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {reports.map(({ idea, score, contribution }) => {
            const tone = verdictTone(score.verdict);
            return (
              <Card key={idea.id} className="break-inside-avoid-page">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl">{idea.title}</CardTitle>
                      <CardDescription>
                        {t("reports.target", "ターゲット")}: {idea.target}
                      </CardDescription>
                      {idea.version ? (
                        <Badge variant="outline">Ver {idea.version}</Badge>
                      ) : null}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.className}`}>
                      {t(`verdict.${tone.label}`, tone.label)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("reports.updatedAt", "更新")}: {formatDate(idea.updatedAt)} ・ {t("reports.price", "価格")}:
                    {formatCurrency(idea.price)}
                  </p>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-3 rounded-2xl border border-border p-4 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{t("reports.psf", "PSF")}</p>
                      <p className="text-xl font-semibold">{score.psf}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("reports.pmf", "PMF")}</p>
                      <p className="text-xl font-semibold">{score.pmf}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("reports.ci", "95%CI")}</p>
                      <p className="text-xl font-semibold">
                        {score.ci95.low}–{score.ci95.high}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("reports.ltv", "顧客LTV予測")}</p>
                      <p className="text-xl font-semibold">{formatCurrency(score.ltv)}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border p-4">
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                      {t("reports.contribution", "寄与要因トップ")}
                    </p>
                    <ol className="grid gap-1 text-sm">
                      {contribution?.factors.map((factor, index) => (
                        <li key={factor.name} className="flex items-center justify-between">
                          <span>
                            {index + 1}. {factor.name}
                          </span>
                          <span className="text-muted-foreground">{Math.round(factor.value * 100)}%</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="rounded-2xl border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("reports.forecast", "売上・利益予測")}
                      </p>
                      {score.revenue_forecast.length > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {t("reports.forecastRange", "{{first}}〜{{last}}ヶ月", {
                            first: score.revenue_forecast[0].month,
                            last: score.revenue_forecast[score.revenue_forecast.length - 1].month
                          })}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <RevenueForecastChart data={score.revenue_forecast} height={200} />
                    </div>
                    <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                      {score.revenue_forecast
                        .slice()
                        .sort((a, b) => a.month - b.month)
                        .map((entry) => (
                          <li key={entry.month} className="flex items-center justify-between gap-3">
                            <span>{t("reports.forecastMonth", "{{month}}ヶ月", { month: entry.month })}</span>
                            <span className="text-right">
                              {formatCurrency(entry.revenue)}
                              <span className="ml-2 text-muted-foreground/80">
                                {t("reports.profitLabel", "利益")}: {formatCurrency(entry.profit)}
                              </span>
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {score.improvement_suggestions.length > 0 ? (
                    <div className="rounded-2xl border border-border p-4">
                      <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                        {t("reports.nextAction", "改善提案")}
                      </p>
                      <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                        {score.improvement_suggestions.map((suggestion) => (
                          <li key={suggestion}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("reports.footerId", "ID")}: {idea.id}
                  </span>
                  <span>
                    {t("reports.totalIdeas", "総案数")}: {totalIdeas}
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
