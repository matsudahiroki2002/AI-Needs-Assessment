"use client";

/**
 * @file Area chart displaying confidence interval bands for a single metric.
 * @remarks Accept pre-shaped data to allow the backend to provide historic confidence values later.
 */
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { t } from "@/lib/i18n";

type ConfidencePoint = {
  label: string;
  low: number;
  high: number;
  midpoint: number;
};

type ConfidenceAreaProps = {
  data: ConfidencePoint[];
};

const tooltipFormatter = (
  _value: number,
  _name: string,
  { payload }: { payload?: ConfidencePoint }
) => {
  if (!payload) return null;
  return [
    `${payload.low} – ${payload.high}`,
    t("charts.confidenceInterval", "95%信頼区間")
  ];
};

const confidenceLabelFormatter = (label: string) =>
  `${t("charts.step", "ステップ")} ${label}`;

const ConfidenceArea = ({ data }: ConfidenceAreaProps) => (
  <div className="h-48 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 16, bottom: 0, left: 0, right: 20 }}>
        <defs>
          <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" hide />
        <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={confidenceLabelFormatter}
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid hsl(var(--border))"
          }}
        />
        <Area
          type="monotone"
          dataKey="high"
          stroke="hsl(var(--primary))"
          strokeWidth={1}
          fill="url(#confidenceGradient)"
        />
        <Area
          type="monotone"
          dataKey="midpoint"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fillOpacity={0}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export type { ConfidenceAreaProps, ConfidencePoint };
export default ConfidenceArea;
