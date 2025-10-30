/**
 * @file PSF/PMF summary card with verdict badge and probability ranges.
 * @remarks Keep layout responsive to ensure mobile grid remains legible when additional metrics are introduced.
 */
import { t } from "@/lib/i18n";
import { Score } from "@/lib/types";
import { formatPercentRange, verdictTone } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

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
              "95%信頼区間での製品適合度。Go/Improve/Killをシグナル表示します。"
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
        <div className="flex flex-col gap-1 rounded-2xl bg-primary/5 p-4">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("dashboard.midpoint", "中央値")}
          </span>
          <span className="text-3xl font-semibold">{midpoint}</span>
          <span className="text-xs text-muted-foreground">
            {t("dashboard.ciRange", "信頼区間")}
            : {score.ci95.low} – {score.ci95.high}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        {METRIC_KEYS.map((metric) => (
          <div
            key={metric.key}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
          >
            {t(metric.labelKey, metric.labelKey)}:{" "}
            {formatPercentRange(score[metric.key])}
          </div>
        ))}
      </CardFooter>
    </Card>
  );
};
