/**
 * @file Presentation component for the registered persona catalog.
 * @remarks Designed as simple cards so we can later extend to inline editing or detail drawers.
 */
"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonaCategory, PersonaProfile } from "@/lib/types";

type PersonaRegistryListProps = {
  personas: PersonaProfile[];
  loading?: boolean;
};

const categoryAccent: Record<PersonaCategory, string> = {
  大企業決裁者: "bg-slate-200 text-slate-800",
  VC: "bg-amber-200 text-amber-900",
  スタートアップ決裁者: "bg-emerald-200 text-emerald-900",
  デザイナー: "bg-indigo-200 text-indigo-900",
  学生: "bg-sky-200 text-sky-900",
  主婦: "bg-rose-200 text-rose-900"
};

export const PersonaRegistryList = ({ personas, loading }: PersonaRegistryListProps) => {
  if (loading) {
    return <p className="text-sm text-muted-foreground">ペルソナを読み込み中です…</p>;
  }

  if (!personas.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        登録済みのペルソナはまだありません。フォームから最初のペルソナを追加してください。
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {personas.map((persona, index) => (
        <motion.div
          key={persona.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
        >
          <Card className="h-full rounded-2xl border-border/70 shadow-lg">
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg font-semibold">{persona.name}</CardTitle>
                <Badge className={categoryAccent[persona.category] ?? "bg-secondary"}>
                  {persona.category}
                </Badge>
              </div>
              {persona.comment_style && (
                <p className="text-xs text-muted-foreground">
                  コメントスタイル：{persona.comment_style}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
                {persona.age !== undefined && <span>年齢：{persona.age}歳</span>}
                {persona.gender && <span>性別：{persona.gender}</span>}
              </div>
              {persona.background && (
                <p className="rounded-xl bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
                  {persona.background}
                </p>
              )}
              {persona.traits && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Traits
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(persona.traits).map(([trait, value]) => (
                      <li
                        key={trait}
                        className="flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2 text-xs font-medium text-primary"
                      >
                        <span>{trait}</span>
                        <span>{value.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
