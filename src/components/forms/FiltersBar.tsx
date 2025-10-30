/**
 * @file Horizontal filters bar for list pages to expose quick search controls.
 * @remarks Keep this form uncontrolled to allow query param syncing later without heavy rewrites.
 */
"use client";

import { ChangeEvent } from "react";
import { Filter } from "lucide-react";

import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type FiltersBarProps = {
  segments: string[];
  onTraitChange?: (trait: string, value: number) => void;
  traits?: { novelty?: number; price_sensitivity?: number; time_constraint?: number };
};

export const FiltersBar = ({ segments, onTraitChange, traits }: FiltersBarProps) => {
  const filters = useUIStore((state) => state.filters);
  const setFilters = useUIStore((state) => state.setFilters);

  const handleSegmentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value || undefined;
    setFilters({ segment: value });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: event.target.value });
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
          <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {t("filters.title", "条件を調整")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("filters.subtitle", "セグメント・検索・特性を組み合わせて分析します。")}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="segments">{t("filters.segment", "セグメント")}</Label>
          <Select id="segments" value={filters.segment ?? ""} onChange={handleSegmentChange}>
            <option value="">{t("filters.allSegments", "すべてのセグメント")}</option>
            {segments.map((segment) => (
              <option key={segment} value={segment}>
                {segment}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="search">{t("filters.search", "キーワード")}</Label>
          <Input
            id="search"
            placeholder={t("filters.searchPlaceholder", "キーワードを入力")}
            value={filters.search ?? ""}
            onChange={handleSearchChange}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["novelty", "price_sensitivity", "time_constraint"] as const).map((traitKey) => (
            <div key={traitKey} className="flex flex-col gap-1">
              <Label className="text-xs">{t(`filters.${traitKey}`, traitKey)}</Label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={traits?.[traitKey] ?? 0.5}
                onChange={(event) =>
                  onTraitChange?.(traitKey, Number.parseFloat(event.target.value))
                }
                aria-label={t(`filters.${traitKey}`, traitKey)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setFilters({ search: "", segment: undefined })}>
          {t("filters.reset", "条件をリセット")}
        </Button>
      </div>
    </section>
  );
};
