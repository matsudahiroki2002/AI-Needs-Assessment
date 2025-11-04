/**
 * @file Idea creation form backed by react-hook-form and zod validations.
 * @remarks The submission flow mirrors the eventual API contract, so keep field names aligned with backend expectations.
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/apiClient";
import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { useProjectStore } from "@/store/projectStore";

const ideaSchema = z.object({
  title: z
    .string()
    .min(2, { message: t("ideaForm.validation.title", "タイトルは2文字以上で入力してください。") }),
  target: z.string().min(2, {
    message: t("ideaForm.validation.target", "ターゲットの短い説明を入力してください。")
  }),
  pain: z.string().min(5, { message: t("ideaForm.validation.pain", "課題をもう少し詳細に記入してください。") }),
  solution: z
    .string()
    .min(5, { message: t("ideaForm.validation.solution", "解決アプローチを記入してください。") }),
  price: z.coerce
    .number()
    .min(0, { message: t("ideaForm.validation.price", "価格は0以上で入力してください。") }),
  channel: z.string().min(2, {
    message: t("ideaForm.validation.channel", "想定チャネルを入力してください。")
  }),
  onboarding: z
    .string()
    .min(5, { message: t("ideaForm.validation.onboarding", "導入フローの概要を記入してください。") }),
  version: z.string().min(1)
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

type IdeaFormProps = {
  onCreated?: () => Promise<void> | void;
};

export const IdeaForm = ({ onCreated }: IdeaFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const setToast = useUIStore((state) => state.setToast);
  const setLoading = useUIStore((state) => state.setLoading);
  const { currentProject } = useProjectStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: { version: "A" }
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setLoading(true);
    try {
      await api.createIdea({ ...values, projectId: currentProject });
      setToast({
        message: t("ideaForm.toast.success", "案を作成しました。"),
        tone: "success"
      });
      reset();
      await onCreated?.();
    } catch (error) {
      console.error(error);
      setToast({
        message: t("ideaForm.toast.error", "作成に失敗しました。時間を置いて再試行してください。"),
        tone: "error"
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="version">バージョン</Label>
        <Select id="version" {...register("version")}>
          <option value="A">Ver A</option>
          <option value="B">Ver B</option>
          <option value="C">Ver C</option>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="title">{t("ideaForm.field.title", "案のタイトル")}</Label>
        <Input id="title" placeholder={t("ideaForm.placeholder.title", "例: AI動画編集コンシェルジュ")} {...register("title")} />
        {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="target">{t("ideaForm.field.target", "ターゲット")}</Label>
        <Input id="target" placeholder={t("ideaForm.placeholder.target", "学生 / クリエイター志望")} {...register("target")} />
        {errors.target ? <p className="text-xs text-destructive">{errors.target.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pain">{t("ideaForm.field.pain", "解決したい課題")}</Label>
        <Textarea id="pain" rows={3} {...register("pain")} />
        {errors.pain ? <p className="text-xs text-destructive">{errors.pain.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="solution">{t("ideaForm.field.solution", "提案する解決策")}</Label>
        <Textarea id="solution" rows={3} {...register("solution")} />
        {errors.solution ? <p className="text-xs text-destructive">{errors.solution.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price">{t("ideaForm.field.price", "想定価格 (JPY)")} </Label>
        <Input id="price" type="number" min={0} step={500} {...register("price")} />
        {errors.price ? <p className="text-xs text-destructive">{errors.price.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="channel">{t("ideaForm.field.channel", "想定チャネル")}</Label>
        <Select id="channel" {...register("channel")}>
          <option value="">{t("ideaForm.placeholder.channel", "チャネルを選択")}</option>
          <option value="SNS広告">{t("ideaForm.channel.social", "SNS広告")}</option>
          <option value="メール">{t("ideaForm.channel.email", "メール")}</option>
          <option value="ウェビナー">{t("ideaForm.channel.webinar", "ウェビナー")}</option>
          <option value="店舗内告知">{t("ideaForm.channel.retail", "店舗内告知")}</option>
        </Select>
        {errors.channel ? <p className="text-xs text-destructive">{errors.channel.message}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="onboarding">{t("ideaForm.field.onboarding", "導入フロー概要")}</Label>
        <Textarea id="onboarding" rows={3} {...register("onboarding")} />
        {errors.onboarding ? (
          <p className="text-xs text-destructive">{errors.onboarding.message}</p>
        ) : null}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="reset" variant="ghost" onClick={() => reset()}>
          {t("ideaForm.reset", "リセット")}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? t("ideaForm.submitting", "送信中…") : t("ideaForm.submit", "案を登録")}
        </Button>
      </div>
    </form>
  );
};
