/**
 * @file Personas listing page with filter bar and trait sliders.
 * @remarks Mimics the planned future segmentation workflow while operating fully on mock data.
 */
"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/lib/apiClient";
import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { Persona } from "@/lib/types";
import { FiltersBar } from "@/components/forms/FiltersBar";
import { PersonaForm } from "@/components/forms/PersonaForm";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonasTable } from "@/components/tables/PersonasTable";
import { PersonaRegistryList } from "@/components/tables/PersonaRegistryList";
import { useProjectStore } from "@/store/projectStore";
import { usePersonaStore } from "@/store/personaStore";

type TraitFilters = {
  novelty: number;
  price_sensitivity: number;
  time_constraint: number;
};

const initialTraits: TraitFilters = {
  novelty: 0.5,
  price_sensitivity: 0.5,
  time_constraint: 0.5
};

export default function PersonasPage() {
  const setToast = useUIStore((state) => state.setToast);
  const filters = useUIStore((state) => state.filters);
  const [rawPersonas, setRawPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [traitFilters, setTraitFilters] = useState<TraitFilters>(initialTraits);
  const { currentProject, projectLabel } = useProjectStore();
  const currentProjectLabel = projectLabel(currentProject);
  const fetchPersonas = usePersonaStore((state) => state.fetchPersonas);
  const registered = usePersonaStore((state) => state.personas);
  const registeredLoading = usePersonaStore((state) => state.loading);
  const personaError = usePersonaStore((state) => state.error);
  const resetPersonaError = usePersonaStore((state) => state.resetError);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const personas = await api.getPersonas(
          { segment: filters.segment, projectId: currentProject },
          controller.signal
        );
        setRawPersonas(personas);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [currentProject, filters.segment]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPersonas(controller.signal).catch((error) => {
      console.error(error);
    });
    return () => controller.abort();
  }, [fetchPersonas]);

  useEffect(() => {
    if (!personaError) return;
    setToast({ tone: "error", message: personaError });
    resetPersonaError();
  }, [personaError, resetPersonaError, setToast]);

  const filtered = useMemo(() => {
    return rawPersonas.filter((persona) => {
      const searchMatch = filters.search
        ? [persona.agent_id, persona.segment, persona.social?.community ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;
      const traitMatch =
        persona.traits.novelty >= traitFilters.novelty - 0.2 &&
        persona.traits.price_sensitivity >= traitFilters.price_sensitivity - 0.2 &&
        persona.traits.time_constraint >= traitFilters.time_constraint - 0.2;
      return searchMatch && traitMatch;
    });
  }, [rawPersonas, filters.search, traitFilters]);

  const segments = useMemo(
    () => Array.from(new Set(rawPersonas.map((persona) => persona.segment))),
    [rawPersonas]
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">
          {t("personas.title", "合成ペルソナ一覧")}（{currentProjectLabel}）
        </h1>
        <p className="text-sm text-muted-foreground">
          {t(
            "personas.subtitle",
            "セグメントや特性を軸に仮想ユーザーの洞察を横断的に確認できます。"
          )}
        </p>
      </section>

      <section className="grid gap-6 rounded-2xl border border-border bg-card/40 p-6 shadow-lg lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">デジタルツインを登録</h2>
            <p className="text-sm text-muted-foreground">
              実在の友人や顧客をモデルにしたペルソナを登録し、反応生成に活用します。
            </p>
          </div>
          <PersonaForm />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">登録済みペルソナ</h2>
            <p className="text-xs text-muted-foreground">
              現在 {registered.length} 名（カテゴリ：
              {Array.from(new Set(registered.map((item) => item.category))).join(" / ") || "未登録"}）
            </p>
          </div>
          <PersonaRegistryList personas={registered} loading={registeredLoading} />
          {registered.length === 0 && (
            <div className="rounded-2xl bg-primary/5 p-4 text-xs text-primary">
              推奨カテゴリは「スタートアップ決裁者」「学生」です。必要に応じて他カテゴリも追加できます。
            </div>
          )}
        </div>
      </section>

      <FiltersBar
        segments={segments}
        traits={traitFilters}
        onTraitChange={(trait, value) =>
          setTraitFilters((prev) => ({ ...prev, [trait]: value }))
        }
      />

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <PersonasTable personas={filtered} />
      )}
    </div>
  );
}
