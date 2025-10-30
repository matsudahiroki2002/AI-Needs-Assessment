/**
 * @file Persona registration form used to capture digital-twin style respondent profiles.
 * @remarks The form is intentionally simple so it can evolve into a multi-step wizard later without reworking state wiring.
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePersonaStore, type PersonaFormInput } from "@/store/personaStore";

const personaCategoryValues = [
  "スタートアップ決裁者",
  "学生",
  "大企業決裁者",
  "VC",
  "デザイナー",
  "主婦"
] as const;

const categories = [
  { value: personaCategoryValues[0], label: "スタートアップ決裁者", enabled: true },
  { value: personaCategoryValues[1], label: "学生", enabled: true },
  { value: personaCategoryValues[2], label: "大企業決裁者", enabled: false },
  { value: personaCategoryValues[3], label: "VC（ベンチャーキャピタリスト）", enabled: false },
  { value: personaCategoryValues[4], label: "デザイナー", enabled: false },
  { value: personaCategoryValues[5], label: "主婦", enabled: false }
] as const;

const traitFieldDefaults = [
  { key: "novelty", value: 0.7 },
  { key: "price_sensitivity", value: 0.5 },
  { key: "social_dependence", value: 0.5 },
  { key: "brand_loyalty", value: 0.4 }
];

const preprocessOptionalNumber = (schema: z.ZodTypeAny) =>
  z.preprocess((value) => {
    if (value === "" || value === null || typeof value === "undefined") {
      return undefined;
    }
    return value;
  }, schema.optional());

const traitSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "指標名を入力してください"),
  value: z
    .preprocess((input) => (input === "" ? undefined : input), z.coerce.number().min(0).max(1))
    .refine((value) => value !== undefined, { message: "0.0〜1.0の数値を入力してください" })
});

const formSchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  category: z.enum(personaCategoryValues),
  age: preprocessOptionalNumber(z.coerce.number().int().min(0).max(120)),
  gender: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  background: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  comment_style: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  traits: z.array(traitSchema).min(1, "指標を1つ以上設定してください")
});

type PersonaFormValues = z.infer<typeof formSchema>;

export const PersonaForm = () => {
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PersonaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: categories[0].value,
      age: undefined,
      gender: "",
      background: "",
      comment_style: "フレンドリー",
      traits: traitFieldDefaults
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "traits"
  });

  const createPersona = usePersonaStore((state) => state.createPersona);
  const setToast = useUIStore((state) => state.setToast);

  const onSubmit = async (values: PersonaFormValues) => {
    const payload: PersonaFormInput = {
      name: values.name.trim(),
      category: values.category,
      age: values.age,
      gender: values.gender,
      background: values.background,
      comment_style: values.comment_style,
      traits: values.traits.reduce<Record<string, number>>((acc, trait) => {
        const trimmed = trait.key.trim();
        if (!trimmed) return acc;
        acc[trimmed] = Number(trait.value.toFixed(2));
        return acc;
      }, {})
    };

    const persona = await createPersona(payload);
    if (!persona) {
      setToast({
        tone: "error",
        message: "ペルソナの登録に失敗しました。もう一度お試しください。"
      });
      return;
    }

    setToast({
      tone: "success",
      message: `${persona.name} を登録しました`
    });
    reset({
      name: "",
      category: values.category,
      age: undefined,
      gender: "",
      background: "",
      comment_style: values.comment_style,
      traits: traitFieldDefaults
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="persona-name">氏名 / ニックネーム</Label>
        <Input id="persona-name" placeholder="例：山田太郎" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="persona-category">カテゴリ</Label>
          <Select
            id="persona-category"
            {...register("category")}
            aria-label="ペルソナカテゴリを選択"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value} disabled={!category.enabled}>
                {category.label}
                {!category.enabled ? "（近日対応）" : ""}
              </option>
            ))}
          </Select>
          {errors.category && (
            <p className="text-xs text-destructive">カテゴリを選択してください</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="persona-comment-style">コメントスタイル</Label>
          <Input
            id="persona-comment-style"
            placeholder="例：冷静分析型 / 辛口 / フレンドリー"
            {...register("comment_style")}
          />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="persona-age">年齢</Label>
          <Input id="persona-age" type="number" min={0} max={120} {...register("age")} />
          {errors.age && <p className="text-xs text-destructive">0〜120の数値で入力してください</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="persona-gender">性別</Label>
          <Input id="persona-gender" placeholder="任意" {...register("gender")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="persona-background">バックグラウンド</Label>
        <Textarea
          id="persona-background"
          rows={3}
          placeholder="職種や経験、意思決定スタイルなどを記述"
          {...register("background")}
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-dashed border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">特性スコア（0.0〜1.0）</p>
            <p className="text-xs text-muted-foreground">
              コメント生成時の重み付けに利用されます。必要に応じて指標を追加できます。
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Plus className="h-4 w-4" aria-hidden="true" />}
            onClick={() =>
              append({
                key: `custom_trait_${fields.length + 1}`,
                value: 0.5
              })
            }
          >
            指標を追加
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-2 rounded-2xl bg-card/60 p-3 shadow-sm sm:grid-cols-[1fr_auto_auto]"
            >
              <Input placeholder="指標名（例：novelty）" {...register(`traits.${index}.key` as const)} />
              <Input
                type="number"
                step="0.01"
                min={0}
                max={1}
                {...register(`traits.${index}.value` as const)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-self-end text-xs"
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
              >
                削除
              </Button>
              {errors.traits?.[index]?.key && (
                <p className="text-xs text-destructive">{errors.traits[index]?.key?.message}</p>
              )}
              {errors.traits?.[index]?.value && (
                <p className="text-xs text-destructive sm:col-start-2 sm:col-end-4">
                  {errors.traits[index]?.value?.message}
                </p>
              )}
            </div>
          ))}
        </div>
        {typeof errors.traits?.message === "string" && (
          <p className="text-xs text-destructive">{errors.traits.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        ペルソナを登録
      </Button>
    </form>
  );
};
