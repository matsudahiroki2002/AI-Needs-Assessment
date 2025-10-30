"use client";

/**
 * @file Sparkline component for compact trend hints within cards.
 * @remarks Keep props minimal so we can pass streaming data without reworking chart internals.
 */
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

import { t } from "@/lib/i18n";

type TrendSparklineProps = {
  data: Array<{ label: string; value: number }>;
};

const tooltipFormatter = (value: number) => [`${value}%`, t("charts.trend", "トレンド")];

const TrendSparkline = ({ data }: TrendSparklineProps) => (
  <div className="h-20 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <Tooltip
          formatter={tooltipFormatter}
          labelFormatter={(label) => label}
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid hsl(var(--border))"
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default TrendSparkline;
