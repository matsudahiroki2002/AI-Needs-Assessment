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
import { PersonasTable } from "@/components/tables/PersonasTable";
import { FiltersBar } from "@/components/forms/FiltersBar";
import { Skeleton } from "@/components/ui/skeleton";
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
  const filters = useUIStore((state) => state.filters);
  const [rawPersonas, setRawPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [traitFilters, setTraitFilters] = useState<TraitFilters>(initialTraits);
  const { currentProject, projectLabel } = useProjectStore();
  const currentProjectLabel = projectLabel(currentProject);

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
