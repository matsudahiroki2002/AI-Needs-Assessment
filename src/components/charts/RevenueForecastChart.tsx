"use client";

/**
 * @file Combined line chart for revenue and profit forecasts.
 * @remarks Keep the component lightweight so it can be embedded inside cards on dashboards and reports.
 */
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { t } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

import type { RevenueForecast } from "@/lib/types";

type RevenueForecastChartProps = {
  data: RevenueForecast[];
  height?: number;
};

const formatMonth = (month: number) => t("charts.monthLabel", "{{month}}ヶ月", { month });

const RevenueForecastChart = ({ data, height = 220 }: RevenueForecastChartProps) => {
  const chartData = data
    .slice()
    .sort((a, b) => a.month - b.month)
    .map((point) => ({
      label: formatMonth(point.month),
      revenue: point.revenue,
      profit: point.profit
    }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 12, right: 16, bottom: 8, left: 4 }}
        >
          <CartesianGrid strokeDasharray="4 8" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(Number(value)).replace(/¥/, "")}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            width={80}
          />
          <Tooltip
            formatter={(value: number, key) => [
              formatCurrency(value),
              key === "revenue"
                ? t("charts.revenue", "売上")
                : t("charts.profit", "利益")
            ]}
            labelFormatter={(label) => label}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 8px 24px -16px rgba(15, 23, 42, 0.45)"
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name={t("charts.revenue", "売上")}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name={t("charts.profit", "利益")}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueForecastChart;
