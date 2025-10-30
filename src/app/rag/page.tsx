/**
 * @file RAG source browser listing mock documents with search capabilities.
 * @remarks The filter UI mirrors the planned backend query parameters.
 */
"use client";

import { FormEvent, useEffect, useState } from "react";

import { api } from "@/lib/apiClient";
import { t } from "@/lib/i18n";
import { RagDoc } from "@/lib/types";
import { RAGTable } from "@/components/tables/RAGTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore } from "@/store/projectStore";

type RagKind = RagDoc["kind"] | "";

export default function RagPage() {
  const [docs, setDocs] = useState<RagDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [kind, setKind] = useState<RagKind>("");
  const { currentProject, projectLabel } = useProjectStore();
  const currentProjectLabel = projectLabel(currentProject);

  const fetchDocs = async (params?: { q?: string; kind?: RagDoc["kind"] }) => {
    setLoading(true);
    try {
      const result = await api.getRagDocs({ ...params, projectId: currentProject });
      setDocs(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [currentProject]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchDocs({
      q: keyword || undefined,
      kind: kind || undefined
    });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">
          {t("rag.title", "RAGソースブラウズ")}（{currentProjectLabel}）
        </h1>
        <p className="text-sm text-muted-foreground">
          {t(
            "rag.subtitle",
            "レビューや価格動向などの情報源を一覧し、検証に役立つポイントを抽出します。"
          )}
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:grid-cols-[2fr,1fr,auto]"
      >
        <div className="grid gap-2">
          <Label htmlFor="q">{t("rag.search.label", "キーワード")}</Label>
          <Input
            id="q"
            placeholder={t("rag.search.placeholder", "例: 価格, 継続率")}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="kind">{t("rag.filter.kind", "ドキュメント種別")}</Label>
          <Select
            id="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as RagKind)}
          >
            <option value="">{t("rag.filter.all", "すべて")}</option>
            <option value="review">{t("rag.kind.review", "レビュー")}</option>
            <option value="pricing">{t("rag.kind.pricing", "価格情報")}</option>
            <option value="policy">{t("rag.kind.policy", "規約・法令")}</option>
            <option value="trend">{t("rag.kind.trend", "トレンド")}</option>
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit">{t("rag.search.submit", "検索")}</Button>
        </div>
      </form>

      {loading ? <Skeleton className="h-96 w-full" /> : <RAGTable docs={docs} />}
    </div>
  );
}
