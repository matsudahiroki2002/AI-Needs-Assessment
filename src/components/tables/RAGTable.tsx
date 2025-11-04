/**
 * @file Retrieval augmented generation source table with filtering support.
 * @remarks Keep data props aligned with RagDoc schema for backend compatibility.
 */
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { t } from "@/lib/i18n";
import { RagDoc } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type RAGTableProps = {
  docs: RagDoc[];
};

const kindLabel = (kind: RagDoc["kind"]) => {
  switch (kind) {
    case "review":
      return t("rag.kind.review", "レビュー");
    case "pricing":
      return t("rag.kind.pricing", "価格情報");
    case "policy":
      return t("rag.kind.policy", "規約・法令");
    case "trend":
      return t("rag.kind.trend", "トレンド");
    default:
      return kind;
  }
};

export const RAGTable = ({ docs }: RAGTableProps) => (
  <div className="overflow-hidden rounded-2xl border border-border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("rag.table.kind", "種別")}</TableHead>
          <TableHead>{t("rag.table.source", "出典")}</TableHead>
          <TableHead>{t("rag.table.excerpt", "抜粋")}</TableHead>
          <TableHead>{t("rag.table.updatedAt", "更新日")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {docs.map((doc) => (
          <TableRow key={doc.id} className="align-top">
            <TableCell className="pt-5">
              <Badge variant="outline">{kindLabel(doc.kind)}</Badge>
            </TableCell>
            <TableCell className="pt-5">
              <span className="font-medium">{doc.source}</span>
            </TableCell>
            <TableCell className="whitespace-pre-line pt-5">{doc.excerpt}</TableCell>
            <TableCell className="pt-5 text-sm text-muted-foreground">
              {formatDate(doc.updatedAt)}
            </TableCell>
          </TableRow>
        ))}
        {docs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
              {t("rag.table.empty", "該当するナレッジが見つかりません。条件を調整してください。")}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  </div>
);
