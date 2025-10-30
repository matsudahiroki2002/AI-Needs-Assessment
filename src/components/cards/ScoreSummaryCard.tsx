/**
 * @file Detailed score summary card used on idea detail pages.
 * @remarks Structure metrics in semantic groups to keep accessibility intact when values update dynamically.
 */
import { t } from "@/lib/i18n";
import { Score } from "@/lib/types";
import { formatPercentRange, verdictTone } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ScoreSummaryCardProps = {
  score: Score;
};

export const ScoreSummaryCard = ({ score }: ScoreSummaryCardProps) => {
  const tone = verdictTone(score.verdict);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl">
            {t("ideaDetail.scoreTitle", "検証スコア概要")}
          </CardTitle>
          <CardDescription>
            {t(
              "ideaDetail.scoreSubtitle",
              "PSF/PMFと主要KPIレンジを集約し、意思決定のサマリを提示します。"
            )}
          </CardDescription>
        </div>
        <Badge className={tone.className} variant="soft">
          {t(`verdict.${tone.label}`, tone.label)}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl bg-primary/5 p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("ideaDetail.psf", "PSF")}
            </p>
            <p className="text-3xl font-semibold">{score.psf}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("ideaDetail.pmf", "PMF")}
            </p>
            <p className="text-3xl font-semibold">{score.pmf}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("ideaDetail.ci", "95%信頼区間")}
            </p>
            <p className="text-lg font-medium">
              {score.ci95.low} – {score.ci95.high}
            </p>
          </div>
        </div>
        <dl className="grid gap-4 text-sm">
          <div className="rounded-2xl border border-border p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("ideaDetail.metricApply", "P(申込)レンジ")}
            </dt>
            <dd className="text-lg font-medium">
              {formatPercentRange(score.p_apply)}
            </dd>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("ideaDetail.metricPurchase", "P(購入)レンジ")}
            </dt>
            <dd className="text-lg font-medium">
              {formatPercentRange(score.p_purchase)}
            </dd>
          </div>
          <div className="rounded-2xl border border-border p-4">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("ideaDetail.metricD7", "P(D7)レンジ")}
            </dt>
            <dd className="text-lg font-medium">
              {formatPercentRange(score.p_d7)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
