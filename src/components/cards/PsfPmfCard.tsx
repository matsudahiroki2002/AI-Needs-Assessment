/**
 * @file PSF/PMF summary card with verdict badge and probability ranges.
 * @remarks 拡張指標（LTV・売上予測）を含め、ダッシュボードでも一目で判断できるように可視化します。
 */
import RevenueForecastChart from "@/components/charts/RevenueForecastChart";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { Score } from "@/lib/types";
import { formatCurrency, formatPercentRange, verdictTone } from "@/lib/utils";

type PsfPmfCardProps = {
  score: Score;
};

const METRIC_KEYS: Array<{
  key: keyof Pick<Score, "p_apply" | "p_purchase" | "p_d7">;
  labelKey: string;
}> = [
  { key: "p_apply", labelKey: "dashboard.metricApply" },
  { key: "p_purchase", labelKey: "dashboard.metricPurchase" },
  { key: "p_d7", labelKey: "dashboard.metricDay7" }
];

export const PsfPmfCard = ({ score }: PsfPmfCardProps) => {
  const tone = verdictTone(score.verdict);
  const midpoint = Math.round((score.psf + score.pmf) / 2);
  const ciWidth = score.ci95.high - score.ci95.low;
  const forecastData = score.revenue_forecast
    .slice()
    .sort((a, b) => a.month - b.month);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-2xl">
            {t("dashboard.psfPmfTitle", "PSF / PMF プロファイル")}
          </CardTitle>
          <CardDescription>
            {t(
              "dashboard.psfPmfSubtitle",
              "95%信頼区間とLTV、売上・利益予測を併記して全体像を把握します。"
            )}
          </CardDescription>
        </div>
        <Badge className={tone.className} variant="soft">
          {t(`verdict.${tone.label}`, tone.label)}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-2xl bg-primary/5 p-4">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("dashboard.psfLabel", "PSF")}
          </span>
          <span className="text-3xl font-semibold">{score.psf}</span>
          <span className="text-xs text-muted-foreground">
            ±{Math.round(ciWidth / 2)} / 95%CI
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl bg-primary/5 p-4">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("dashboard.pmfLabel", "PMF")}
          </span>
          <span className="text-3xl font-semibold">{score.pmf}</span>
          <span className="text-xs text-muted-foreground">
            ±{Math.round(ciWidth / 2)} / 95%CI
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-border p-4">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("dashboard.midpoint", "中央値")}
          </span>
          <span className="text-3xl font-semibold">{midpoint}</span>
          <span className="text-xs text-muted-foreground">
            {t("dashboard.ltvLabel", "LTV")}: {formatCurrency(score.ltv)}
          </span>
        </div>

        <div className="md:col-span-3 rounded-2xl border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("dashboard.forecastHeading", "売上・利益予測")}
            </span>
            {forecastData.length > 0 ? (
              <span className="text-xs text-muted-foreground">
                {t("dashboard.forecastRange", "{{first}}〜{{last}}ヶ月", {
                  first: forecastData[0].month,
                  last: forecastData[forecastData.length - 1].month
                })}
              </span>
            ) : null}
          </div>
          <div className="mt-4">
            <RevenueForecastChart data={forecastData} height={200} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          {METRIC_KEYS.map((metric) => (
            <span
              key={metric.key}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {t(metric.labelKey, metric.labelKey)}: {formatPercentRange(score[metric.key])}
            </span>
          ))}
        </div>
        {score.improvement_suggestions.length > 0 ? (
          <div className="rounded-2xl border border-border/70 bg-background/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <p className="mb-2 font-semibold text-foreground">
              {t("dashboard.improvementHeading", "改善提案")}
            </p>
            <ul className="list-disc space-y-1 pl-4">
              {score.improvement_suggestions.slice(0, 2).map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
};
