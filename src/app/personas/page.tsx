/**
 * @file Personas listing page with filter bar and trait sliders.
 * @remarks Mimics the planned future segmentation workflow while operating fully on mock data.
 */
"use client";

import { useEffect, useMemo, useState } from "react";

import { FiltersBar } from "@/components/forms/FiltersBar";
import PersonaEditor from "@/components/personas/PersonaEditor";
import { PersonaRegistryList } from "@/components/tables/PersonaRegistryList";
import { PersonasTable } from "@/components/tables/PersonasTable";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/apiClient";
import { isPersonaEverywhereEnabled } from "@/lib/featureFlags";
import { t } from "@/lib/i18n";
import { logLegacyAgentUsage, resolvePersonaRef } from "@/lib/personaRegistry";
import { useUIStore } from "@/lib/store";
import { Persona } from "@/lib/types";
import { usePersonaStore } from "@/store/personaStore";
import { useProjectStore } from "@/store/projectStore";

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
  const personaEverywhere = isPersonaEverywhereEnabled();
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
        if (personaEverywhere) {
          personas.forEach((persona) => {
            if (persona.agent_id) {
              logLegacyAgentUsage(persona.agent_id);
            }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [currentProject, filters.segment, personaEverywhere]);

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
      const personaRef = personaEverywhere
        ? resolvePersonaRef({ legacyAgentId: persona.agent_id, fallbackDisplayName: persona.segment })
        : undefined;
      const searchMatch = filters.search
        ? (
            personaEverywhere
              ? [
                  personaRef?.displayName,
                  personaRef?.slug,
                  personaRef?.personaId,
                  persona.segment,
                  persona.social?.community ?? ""
                ]
              : [persona.agent_id, persona.segment, persona.social?.community ?? ""]
          )
            .filter(Boolean)
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
  }, [rawPersonas, filters.search, traitFilters, personaEverywhere]);

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

      <section className="grid gap-6 rounded-2xl border border-border bg-card/40 p-6 shadow-lg lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-4 lg:col-span-1">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">ペルソナエディタ</h2>
            <p className="text-sm text-muted-foreground">
              属性や思考傾向を入力し、性格タグ付きのペルソナ定義を作成します。
            </p>
          </div>
          <PersonaEditor showHeader={false} className="space-y-4" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">登録済みペルソナ</h2>
            <p className="text-xs text-muted-foreground">
              現在 {registered.length} 名（主な職種：
              {Array.from(new Set(registered.map((item) => item.occupation))).join(" / ") || "未登録"}）
            </p>
          </div>
          <PersonaRegistryList personas={registered} loading={registeredLoading} />
          {registered.length === 0 && (
            <div className="rounded-2xl bg-primary/5 p-4 text-xs text-primary">
              ペルソナエディタでプロフィールとスコアを入力し、「性格タグを生成」してみましょう。
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
