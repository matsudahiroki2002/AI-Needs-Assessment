"use client";

/**
 * @file Detailed score summary card used on idea detail pages.
 * @remarks Enriches core PSF/PMF metrics with LTV、売上予測、改善提案を視覚的に提示します。
 */
import RevenueForecastChart from "@/components/charts/RevenueForecastChart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { Score } from "@/lib/types";
import { formatCurrency, formatPercentRange, verdictTone } from "@/lib/utils";

type ScoreSummaryCardProps = {
  score: Score;
};

export const ScoreSummaryCard = ({ score }: ScoreSummaryCardProps) => {
  const tone = verdictTone(score.verdict);
  const forecastData = score.revenue_forecast
    .slice()
    .sort((a, b) => a.month - b.month);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl">{t("ideaDetail.scoreTitle", "検証スコア概要")}</CardTitle>
          <CardDescription>
            {t(
              "ideaDetail.scoreSubtitle",
              "PSF/PMFと主要KPI、LTV・売上予測をまとめて意思決定に活かします。"
            )}
          </CardDescription>
        </div>
        <Badge className={tone.className} variant="soft">
          {t(`verdict.${tone.label}`, tone.label)}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <HighlightMetric
              label={t("ideaDetail.psf", "PSF")}
              value={score.psf.toString()}
              remark={`${t("ideaDetail.ciRange", "信頼区間")}: ${score.ci95.low} – ${score.ci95.high}`}
            />
            <HighlightMetric
              label={t("ideaDetail.pmf", "PMF")}
              value={score.pmf.toString()}
              remark={`${t("ideaDetail.midpoint", "中央値")} ${Math.round((score.psf + score.pmf) / 2)}`}
            />
            <HighlightMetric
              label={t("ideaDetail.ltv", "予測LTV")}
              value={formatCurrency(score.ltv)}
              remark={t("ideaDetail.ltvHint", "平均顧客価値の推計値")}
              variant="outlined"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricPill
              label={t("ideaDetail.metricApply", "P(申込)レンジ")}
              value={formatPercentRange(score.p_apply)}
            />
            <MetricPill
              label={t("ideaDetail.metricPurchase", "P(購入)レンジ")}
              value={formatPercentRange(score.p_purchase)}
            />
            <MetricPill
              label={t("ideaDetail.metricD7", "P(D7)レンジ")}
              value={formatPercentRange(score.p_d7)}
            />
          </div>

          <div className="rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("ideaDetail.revenueForecast", "売上・利益予測")}
              </p>
              {forecastData.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {t("ideaDetail.monthSummary", "{{first}}〜{{last}}ヶ月", {
                    first: forecastData[0].month,
                    last: forecastData[forecastData.length - 1].month
                  })}
                </span>
              ) : null}
            </div>
            <div className="mt-4">
              <RevenueForecastChart data={forecastData} height={220} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {forecastData.length > 0 ? (
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("ideaDetail.revenueTable", "月次指標一覧")}
              </p>
              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                {forecastData.map((entry) => (
                  <div
                    key={entry.month}
                    className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2"
                  >
                    <span>{t("ideaDetail.monthLabel", "{{month}}ヶ月", { month: entry.month })}</span>
                    <span className="text-right">
                      {formatCurrency(entry.revenue)}
                      <span className="ml-2 text-muted-foreground/80">
                        {t("ideaDetail.profitLabel", "利益")}: {formatCurrency(entry.profit)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {score.improvement_suggestions.length > 0 ? (
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("ideaDetail.improvements", "改善提案")}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground">
                {score.improvement_suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

const HighlightMetric = ({
  label,
  value,
  remark,
  variant = "filled"
}: {
  label: string;
  value: string;
  remark?: string;
  variant?: "filled" | "outlined";
}) => (
  <div
    className={
      variant === "filled"
        ? "flex flex-col gap-1 rounded-2xl bg-primary/5 p-4"
        : "flex flex-col gap-1 rounded-2xl border border-border p-4"
    }
  >
    <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
    <span className="text-3xl font-semibold">{value}</span>
    {remark ? <span className="text-xs text-muted-foreground">{remark}</span> : null}
  </div>
);

const MetricPill = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 rounded-2xl border border-border px-4 py-3">
    <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
    <span className="text-lg font-semibold">{value}</span>
  </div>
);
