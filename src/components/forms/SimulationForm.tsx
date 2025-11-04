/**
 * @file Simulation request form allowing analysts to compare multiple ideas.
 * @remarks API payload mirrors SimulationRequest type, so keep field names aligned with backend contract.
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/apiClient";
import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { Idea, SimulationResult } from "@/lib/types";

const simulationSchema = z.object({
  ideaIds: z
    .array(z.string())
    .min(1, { message: t("simulate.validation.idea", "比較する案を1つ以上選択してください。") })
    .max(3, { message: t("simulate.validation.ideaMax", "比較は最大3案までです。") }),
  segment: z.string().optional(),
  novelty: z.coerce.number().min(0).max(1).optional(),
  price_sensitivity: z.coerce.number().min(0).max(1).optional(),
  time_constraint: z.coerce.number().min(0).max(1).optional()
});

type SimulationValues = z.infer<typeof simulationSchema>;

type SimulationFormProps = {
  ideas: Idea[];
  onSimulated: (results: SimulationResult[]) => void;
};

export const SimulationForm = ({ ideas, onSimulated }: SimulationFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const setToast = useUIStore((state) => state.setToast);
  const setLoading = useUIStore((state) => state.setLoading);
  const markSimulationRun = useUIStore((state) => state.markSimulationRun);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch
  } = useForm<SimulationValues>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      ideaIds: [],
      novelty: 0.5,
      price_sensitivity: 0.5,
      time_constraint: 0.5
    }
  });

  const traitFields = watch(["novelty", "price_sensitivity", "time_constraint"]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setLoading(true);
    try {
      const results = await api.simulate({
        ideaIds: values.ideaIds,
        filters: {
          segment: values.segment,
          traits: {
            novelty: values.novelty,
            price_sensitivity: values.price_sensitivity,
            time_constraint: values.time_constraint
          }
        }
      });
      onSimulated(results);
      markSimulationRun();
      setToast({
        message: t("simulate.toast.success", "シミュレーションを更新しました。"),
        tone: "success"
      });
    } catch (error) {
      console.error(error);
      setToast({
        message: t("simulate.toast.error", "シミュレーションに失敗しました。"),
        tone: "error"
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      <div>
        <h3 className="text-lg font-semibold">
          {t("simulate.form.title", "ターゲット条件")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t(
            "simulate.form.subtitle",
            "セグメントと特性を指定して勝率レンジを推定します。"
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="segment">{t("simulate.form.segment", "対象セグメント")}</Label>
          <Select id="segment" defaultValue="" {...register("segment")}>
            <option value="">{t("simulate.form.segmentAll", "すべて")}</option>
            {[...new Set(ideas.map((idea) => idea.target))].map((segment) => (
              <option key={segment} value={segment}>
                {segment}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(["novelty", "price_sensitivity", "time_constraint"] as const).map((trait, index) => (
            <div key={trait} className="grid gap-1">
              <Label className="text-xs">{t(`simulate.form.${trait}`, trait)}</Label>
              <Input
                type="number"
                min={0}
                max={1}
                step={0.1}
                {...register(trait)}
                defaultValue={traitFields[index] ?? 0.5}
              />
            </div>
          ))}
        </div>
      </div>

      <Controller
        name="ideaIds"
        control={control}
        render={({ field }) => (
          <div className="grid gap-3">
            <Label>{t("simulate.form.ideas", "比較する案 (最大3件)")}</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {ideas.map((idea) => {
                const checked = field.value?.includes(idea.id);
                return (
                  <label
                    key={idea.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-4 text-sm shadow-sm transition hover:border-primary"
                  >
                    <input
                      type="checkbox"
                      value={idea.id}
                      checked={checked}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...(field.value ?? []), idea.id].slice(0, 3)
                          : (field.value ?? []).filter((id) => id !== idea.id);
                        field.onChange(next);
                      }}
                      className="mt-1"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{idea.title}</span>
                        {idea.version ? <Badge variant="outline">Ver {idea.version}</Badge> : null}
                      </div>
                      <span className="text-xs text-muted-foreground">{idea.target}</span>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.ideaIds ? (
              <p className="text-xs text-destructive">{errors.ideaIds.message as string}</p>
            ) : null}
          </div>
        )}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? t("simulate.form.running", "計算中…")
            : t("simulate.form.submit", "シミュレーション実行")}
        </Button>
      </div>
    </form>
  );
};
