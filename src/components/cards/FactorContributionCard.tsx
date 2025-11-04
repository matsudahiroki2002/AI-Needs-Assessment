/**
 * @file Factor contribution card combining narrative and bar chart visualisation.
 * @remarks Keep the shape of props aligned with backend contribution payloads for an easy data swap.
 */
import dynamic from "next/dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { Contribution } from "@/lib/types";

const ContributionBar = dynamic(() => import("../charts/ContributionBar"), {
  ssr: false,
  loading: () => (
    <div className="h-48 animate-pulse rounded-2xl bg-muted" aria-busy="true" />
  )
});

type FactorContributionCardProps = {
  contribution: Contribution;
};

export const FactorContributionCard = ({
  contribution
}: FactorContributionCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-xl">
        {t("ideaDetail.contributionTitle", "寄与分解トップ要因")}
      </CardTitle>
      <CardDescription>
        {t(
          "ideaDetail.contributionSubtitle",
          "PSF/PMFスコアに影響する要因を寄与度の高い順に表示します。"
        )}
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-6">
      <ContributionBar contribution={contribution} />
      <ul className="grid gap-2 text-sm text-muted-foreground">
        {contribution.factors.map((factor) => {
          const displayValue = factor.value > 1 ? factor.value : Math.round(factor.value * 100);
          return (
            <li key={factor.name} className="flex items-center justify-between">
              <span>{factor.name}</span>
              <span className="font-medium text-foreground">{displayValue}%</span>
            </li>
          );
        })}
      </ul>
    </CardContent>
  </Card>
);

export default FactorContributionCard;
