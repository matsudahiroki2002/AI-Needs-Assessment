/**
 * @file Sidebar navigation component listing the primary product areas.
 * @remarks Keep link structure synchronized with App Router routes to avoid mismatched navigation states.
 */
"use client";

import Link from "next/link";

import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ProjectSelector } from "@/components/sidebar/ProjectSelector";
import { NavMenu } from "@/components/sidebar/NavMenu";
import { useProjectStore } from "@/store/projectStore";

type AppSidebarProps = {
  className?: string;
};

export const AppSidebar = ({ className }: AppSidebarProps) => {
  const { currentProject, projectLabel } = useProjectStore();
  const currentLabel = projectLabel(currentProject);

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col gap-6 border-r border-border bg-card px-4 py-6",
        className
      )}
    >
      <div className="px-2">
        <Link href={`/${currentProject}/dashboard`} className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-primary/10" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              {t("navigation.virtualUser", "AI Virtual User")}
            </span>
            <span className="text-lg font-semibold">
              {t("navigation.appTitle", "ニーズ調査AI")}
            </span>
            <span className="text-xs text-muted-foreground">{currentLabel}</span>
          </div>
        </Link>
      </div>
      <ProjectSelector />
      <div className="flex-1">
        <NavMenu />
      </div>
      <div className="rounded-2xl bg-secondary/60 p-4">
        <p className="text-xs font-medium text-secondary-foreground">
          {t("navigation.ctaTitle", "実測データとの統合を準備中")}
        </p>
        <p className="mt-2 text-xs text-secondary-foreground/80">
          {t(
            "navigation.ctaBody",
            "バックエンド接続後は、このUIから直接シミュレーションとレポート出力が可能になります。"
          )}
        </p>
      </div>
    </aside>
  );
};
