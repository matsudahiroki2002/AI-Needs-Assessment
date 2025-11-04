/**
 * @file Idea listing table with basic sorting hooks for the Ideas page.
 * @remarks Keep payload typed with Idea/Score to enable straightforward substitution with API results.
 */
"use client";

import { ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { Idea, Score } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";

type IdeasTableProps = {
  ideas: Idea[];
  scores: Score[];
};

type SortKey = "title" | "updatedAt" | "price";

export const IdeasTable = ({ ideas, scores }: IdeasTableProps) => {
  const router = useRouter();
  const filters = useUIStore((state) => state.filters);
  const setSelectedIdeaId = useUIStore((state) => state.setSelectedIdeaId);
  const setFilters = useUIStore((state) => state.setFilters);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortAsc, setSortAsc] = useState(false);
  const { currentProject } = useProjectStore();

  const scoreMap = useMemo(
    () => new Map(scores.map((score) => [score.ideaId, score])),
    [scores]
  );

  const filtered = ideas.filter((idea) => {
    if (!filters.search) return true;
    return [idea.title, idea.target, idea.channel]
      .join(" ")
      .toLowerCase()
      .includes(filters.search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    const direction = sortAsc ? 1 : -1;
    if (sortKey === "title") {
      return a.title.localeCompare(b.title) * direction;
    }
    if (sortKey === "price") {
      return (a.price - b.price) * direction;
    }
    return a.updatedAt.localeCompare(b.updatedAt) * direction;
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const handleRowClick = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    router.push(`/${currentProject}/ideas/${ideaId}`);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">
              <button
                type="button"
                onClick={() => handleSort("title")}
                className="flex items-center gap-2 font-medium"
              >
                {t("ideas.table.title", "アイデア名")}
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead>{t("ideas.table.target", "ターゲット")}</TableHead>
            <TableHead>{t("ideas.table.price", "価格")}</TableHead>
            <TableHead>{t("ideas.table.psf", "PSF")}</TableHead>
            <TableHead>{t("ideas.table.pmf", "PMF")}</TableHead>
            <TableHead className="w-[15%]">
              <button
                type="button"
                onClick={() => handleSort("updatedAt")}
                className="flex items-center gap-2 font-medium"
              >
                {t("ideas.table.updatedAt", "更新日時")}
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((idea) => {
            const score = scoreMap.get(idea.id);
            return (
              <TableRow
                key={idea.id}
                className="cursor-pointer transition hover:bg-accent/10"
                onClick={() => handleRowClick(idea.id)}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span>{idea.title}</span>
                      {idea.version ? (
                        <Badge variant="outline">Ver {idea.version}</Badge>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">{idea.channel}</span>
                  </div>
                </TableCell>
                <TableCell>{idea.target}</TableCell>
                <TableCell>{formatCurrency(idea.price)}</TableCell>
                <TableCell>{score?.psf ?? "—"}</TableCell>
                <TableCell>{score?.pmf ?? "—"}</TableCell>
                <TableCell>{formatDate(idea.updatedAt)}</TableCell>
              </TableRow>
            );
          })}
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                  <p>{t("ideas.table.empty", "条件に一致する案が見つかりません。")}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ search: "" })}
                  >
                    {t("ideas.table.clearFilters", "フィルターをリセット")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
};
