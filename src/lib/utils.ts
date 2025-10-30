/**
 * @file Utility helpers shared across the Needs Research App UI.
 * @remarks Keep helpers small and framework-agnostic to remain reusable when backend APIs arrive.
 */
import clsx from "clsx";

export const cn = (...inputs: Array<string | undefined | null | false>) =>
  clsx(inputs);

export const formatPercent = (value: number) =>
  `${Math.round(value * 100)}%`;

export const formatPercentRange = (range: [number, number]) =>
  `${formatPercent(range[0])} — ${formatPercent(range[1])}`;

export const formatCurrency = (value: number) =>
  `¥${value.toLocaleString("ja-JP")}`;

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));

export const verdictTone = (verdict: "Go" | "Improve" | "Kill") => {
  switch (verdict) {
    case "Go":
      return {
        label: "Go",
        className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20"
      };
    case "Kill":
      return {
        label: "Kill",
        className: "bg-rose-100 text-rose-700 dark:bg-rose-500/20"
      };
    default:
      return {
        label: "Improve",
        className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20"
      };
  }
};
