"use client";

/**
 * @file Horizontal bar chart visualising contribution percentages per factor.
 * @remarks Keep Recharts usage isolated here so alternative chart libs can be swapped with minimal impact.
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { t } from "@/lib/i18n";
import { Contribution } from "@/lib/types";

type ContributionBarProps = {
  contribution: Contribution;
};

const tooltipFormatter = (value: number) =>
  [`${value}%`, t("charts.contributionUnit", "寄与度")];

const tooltipLabelFormatter = (label: string) => label;

const ContributionBar = ({ contribution }: ContributionBarProps) => {
  const data = contribution.factors.map((factor) => ({
    ...factor,
    value: factor.value > 1 ? factor.value : Math.round(factor.value * 100)
  }));

  return (
  <div className="h-72 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 16, right: 24, bottom: 8, left: 24 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 40]} tickFormatter={(value) => `${value}%`} />
        <YAxis dataKey="name" type="category" width={140} />
        <Tooltip
          labelFormatter={tooltipLabelFormatter}
          formatter={tooltipFormatter}
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid hsl(var(--border))"
          }}
        />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[16, 16, 16, 16]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
};

export default ContributionBar;
