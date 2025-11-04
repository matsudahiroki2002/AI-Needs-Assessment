/**
 * @file Reactions table showcasing qualitative user feedback with filtering affordances.
 * @remarks Ensure pagination props remain optional so server pagination can replace client slicing seamlessly.
 */
"use client";

import { useMemo } from "react";

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
import { Reaction } from "@/lib/types";
import { formatDate, formatPercent } from "@/lib/utils";

type ReactionsTableProps = {
  reactions: Reaction[];
  total: number;
  segments: string[];
  activeSegment?: string;
  page: number;
  pageSize: number;
  onSegmentChange?: (segment?: string) => void;
  onPageChange?: (page: number) => void;
};

export const ReactionsTable = ({
  reactions,
  total,
  segments,
  activeSegment,
  page,
  pageSize,
  onSegmentChange,
  onPageChange
}: ReactionsTableProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const segmentChips = useMemo(
    () => [
      { label: t("reactions.segmentAll", "すべて"), value: undefined },
      ...segments.map((segment) => ({ label: segment, value: segment }))
    ],
    [segments]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("reactions.filterLabel", "セグメント絞り込み")}
        </span>
        {segmentChips.map((chip) => (
          <Button
            key={chip.label}
            variant={chip.value === activeSegment ? "default" : "outline"}
            size="sm"
            onClick={() => onSegmentChange?.(chip.value)}
          >
            {chip.label}
          </Button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">{t("reactions.table.segment", "セグメント")}</TableHead>
              <TableHead className="w-[50%]">{t("reactions.table.comment", "コメント")}</TableHead>
              <TableHead>{t("reactions.table.likelihood", "受容確率")}</TableHead>
              <TableHead>{t("reactions.table.intent", "意欲")}</TableHead>
              <TableHead>{t("reactions.table.createdAt", "取得日")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reactions.map((reaction) => (
              <TableRow key={reaction.id} className="align-top">
                <TableCell className="pt-5">
                  <Badge variant="outline">{reaction.segment ?? t("reactions.unknown", "不明")}</Badge>
                </TableCell>
                <TableCell className="whitespace-pre-wrap pt-5 text-sm">
                  {reaction.text}
                </TableCell>
                <TableCell className="pt-5 text-sm text-muted-foreground">
                  {formatPercent(reaction.likelihood)}
                </TableCell>
                <TableCell className="pt-5 text-sm text-muted-foreground">
                  {formatPercent(reaction.intent_to_try)}
                </TableCell>
                <TableCell className="pt-5 text-xs text-muted-foreground">
                  {formatDate(reaction.createdAt)}
                </TableCell>
              </TableRow>
            ))}
            {reactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {t("reactions.empty", "この条件では擬似反応が取得できません。")}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t("reactions.pagination", "{{page}}/{{total}} ページ", {
            page,
            total: totalPages
          })}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            {t("reactions.prev", "前へ")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            {t("reactions.next", "次へ")}
          </Button>
        </div>
      </div>
    </div>
  );
};
