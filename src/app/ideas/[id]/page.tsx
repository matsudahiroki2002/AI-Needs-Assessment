/**
 * @file Idea detail page combining quantitative scores and qualitative insights.
 * @remarks Presents the same structure planned for production so API wiring later is a direct substitution.
 */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Lightbulb, Wand2 } from "lucide-react";

import { api } from "@/lib/apiClient";
import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { Contribution, Idea, Reaction, Score } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ScoreSummaryCard } from "@/components/cards/ScoreSummaryCard";
import FactorContributionCard from "@/components/cards/FactorContributionCard";
import { ReactionsTable } from "@/components/tables/ReactionsTable";
import { useProjectStore } from "@/store/projectStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 6;

export default function IdeaDetailPage() {
  const params = useParams();
  const ideaId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [totalReactions, setTotalReactions] = useState(0);
  const [segments, setSegments] = useState<string[]>([]);
  const [segmentFilter, setSegmentFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [baseLoading, setBaseLoading] = useState(true);
  const [reactionLoading, setReactionLoading] = useState(true);
  const [notFoundCard, setNotFoundCard] = useState(false);
  const setGlobalLoading = useUIStore((state) => state.setLoading);
  const { currentProject } = useProjectStore();

  useEffect(() => {
    if (!ideaId) return;
    setNotFoundCard(false);
    const controller = new AbortController();
    const load = async () => {
      setBaseLoading(true);
      setGlobalLoading(true);
      try {
        const ideas = await api.listIdeas(currentProject, controller.signal);
        const targetIdea = ideas.find((item) => item.id === ideaId) ?? null;
        setIdea(targetIdea);
        if (!targetIdea) {
          setNotFoundCard(true);
          return;
        }
        const [scoreResponse] = await api.getScores([ideaId], controller.signal);
        setScore(scoreResponse);
        const contributionData = await api.getContributions(ideaId, controller.signal);
        setContribution(contributionData);
      } catch (error) {
        console.error(error);
      } finally {
        setBaseLoading(false);
        setGlobalLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [currentProject, ideaId, setGlobalLoading]);

  useEffect(() => {
    if (!ideaId || notFoundCard) return;
    const controller = new AbortController();
    const loadReactions = async () => {
      setReactionLoading(true);
      try {
        const reactionResponse = await api.getReactions(
          ideaId,
          { segment: segmentFilter, page },
          controller.signal
        );
        setReactions(reactionResponse.reactions);
        setTotalReactions(reactionResponse.total);
        setSegments(reactionResponse.segments);
      } catch (error) {
        console.error(error);
      } finally {
        setReactionLoading(false);
      }
    };
    loadReactions();
    return () => controller.abort();
  }, [currentProject, ideaId, segmentFilter, page, notFoundCard]);

  useEffect(() => {
    setPage(1);
  }, [segmentFilter, currentProject]);

  if (!ideaId) {
    return (
      <Card className="mx-auto mt-20 max-w-xl text-center">
        <CardHeader>
          <CardTitle>{t("ideaDetail.invalid", "URLが正しくありません。")}</CardTitle>
          <CardDescription>
            {t("ideaDetail.invalidDescription", "一覧ページから再度アクセスしてください。")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (notFoundCard) {
    return (
      <Card className="mx-auto mt-20 max-w-xl text-center">
        <CardHeader>
          <CardTitle>{t("ideaDetail.notFound", "該当する案が見つかりません。")}</CardTitle>
          <CardDescription>
            {t(
              "ideaDetail.notFoundDescription",
              "案が削除されたかURLが変更された可能性があります。"
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {baseLoading || !idea || !score ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("ideaDetail.ideaId", "Idea ID")} #{idea.id}
                  {idea.version ? ` ・ Ver ${idea.version}` : ""}
                </span>
                <h1 className="text-3xl font-semibold">{idea.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {t("ideaDetail.meta", "ターゲット")}: {idea.target} ・
                  {t("ideaDetail.channel", "チャネル")}: {idea.channel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("ideaDetail.updatedAt", "最終更新日")}: {formatDate(idea.updatedAt)}
                </p>
              </div>

              <ScoreSummaryCard score={score} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {t("ideaDetail.problemSolution", "課題 / ソリューション")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" />
                      {t("ideaDetail.pain", "解決したい課題")}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{idea.pain}</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Wand2 className="h-4 w-4 text-primary" aria-hidden="true" />
                      {t("ideaDetail.solution", "提案する解決策")}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {idea.solution}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {contribution ? <FactorContributionCard contribution={contribution} /> : null}

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {t("ideaDetail.onboardingTitle", "導入フロー")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {idea.onboarding}
                  </p>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("ideaDetail.improveTitle", "改善提案")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "ideaDetail.improveSubtitle",
                      "仮想ユーザーの反応と寄与度から算出した優先施策です。"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="font-medium">
                      {t("ideaDetail.suggestionRewrite", "価値訴求の3秒リライト")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "ideaDetail.suggestionRewriteBody",
                        "動画編集の自動化ではなく成果物のクオリティを冒頭で強調しましょう。"
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="font-medium">
                      {t("ideaDetail.suggestionPricing", "価格帯の再テスト")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "ideaDetail.suggestionPricingBody",
                        "4,000円代前半と5,000円代後半で仮想購入率に差があるため、2パターンを検証します。"
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="font-medium">
                      {t("ideaDetail.suggestionOnboarding", "オンボーディング短縮")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "ideaDetail.suggestionOnboardingBody",
                        "素材アップロード〜初回フィードバックまでを15分以内に収めるガイドを追加。"
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {t("ideaDetail.reactionsTitle", "擬似ユーザー反応")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "ideaDetail.reactionsSubtitle",
                    "セグメントやページを切り替えて詳細コメントを確認できます。"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reactionLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ReactionsTable
                    reactions={reactions}
                    total={totalReactions}
                    segments={segments}
                    activeSegment={segmentFilter}
                    page={page}
                    pageSize={PAGE_SIZE}
                    onSegmentChange={setSegmentFilter}
                    onPageChange={setPage}
                  />
                )}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
