/**
 * @file Persona table summarising synthetic persona attributes.
 * @remarks Maintain semantic descriptions for each numeric trait to support future localisation.
 */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { isPersonaEverywhereEnabled } from "@/lib/featureFlags";
import { t } from "@/lib/i18n";
import { resolvePersonaRef } from "@/lib/personaRegistry";
import { Persona } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type PersonasTableProps = {
  personas: Persona[];
};

const TraitBar = ({ value }: { value: number }) => (
  <div className="h-2 w-full rounded-full bg-muted">
    <div
      className="h-full rounded-full bg-primary/80"
      style={{ width: `${Math.round(value * 100)}%` }}
    />
  </div>
);

export const PersonasTable = ({ personas }: PersonasTableProps) => {
  const personaEverywhere = isPersonaEverywhereEnabled();

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {personaEverywhere
                ? t("personas.table.persona", "ペルソナ")
                : t("personas.table.agentId", "エージェントID")}
            </TableHead>
            <TableHead>{t("personas.table.segment", "セグメント")}</TableHead>
            <TableHead>{t("personas.table.traits", "特性スコア")}</TableHead>
            <TableHead>{t("personas.table.constraints", "制約")}</TableHead>
            <TableHead>{t("personas.table.social", "ソーシャル指標")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {personas.map((persona) => {
            const personaRef = personaEverywhere
              ? resolvePersonaRef({
                  legacyAgentId: persona.agent_id,
                  fallbackDisplayName: persona.segment
                })
              : undefined;

            const unresolved =
              personaEverywhere &&
              personaRef?.legacyAgentId &&
              personaRef.legacyAgentId === personaRef.personaId &&
              !personaRef.slug;

            const displayName = personaEverywhere
              ? personaRef?.displayName ??
                (unresolved
                  ? t("personas.unassigned", "未割当のペルソナ")
                  : persona.segment ?? persona.agent_id)
              : persona.agent_id;

            const identifier = personaEverywhere
              ? personaRef?.slug ??
                (unresolved
                  ? undefined
                  : personaRef?.personaId ?? persona.agent_id)
              : persona.agent_id;

            const rowKey = personaRef?.personaId ?? persona.agent_id;

            return (
              <TableRow key={rowKey}>
                <TableCell className="font-medium">
                  {personaEverywhere ? (
                    <div className="flex flex-col gap-1">
                      <span>{displayName}</span>
                      {identifier ? (
                        <span className="text-xs text-muted-foreground">{identifier}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {t("personas.unassignedHint", "旧IDとのマッピングが未設定です。")}
                        </span>
                      )}
                    </div>
                  ) : (
                    displayName
                  )}
                </TableCell>
                <TableCell>{persona.segment}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>{t("personas.trait.novelty", "新奇性")}</span>
                      <TraitBar value={persona.traits.novelty} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t("personas.trait.priceSensitivity", "価格感度")}</span>
                      <TraitBar value={persona.traits.price_sensitivity} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t("personas.trait.timeConstraint", "時間制約")}</span>
                      <TraitBar value={persona.traits.time_constraint} />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    {persona.constraints?.budget ? (
                      <span>
                        {t("personas.constraint.budget", "予算")}:
                        {formatCurrency(persona.constraints.budget)}
                      </span>
                    ) : null}
                    {persona.constraints?.time ? (
                      <span>
                        {t("personas.constraint.time", "時間")}:
                        {persona.constraints.time}h/週
                      </span>
                    ) : null}
                    {!persona.constraints ? t("personas.constraint.none", "特記事項なし") : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    {persona.social?.community ? (
                      <span>{persona.social.community}</span>
                    ) : (
                      t("personas.social.none", "コミュニティ情報なし")
                    )}
                    {persona.social?.degree !== undefined ? (
                      <span>
                        {t("personas.social.degree", "影響度")}: 
                        {Math.round((persona.social.degree ?? 0) * 100)}%
                      </span>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
