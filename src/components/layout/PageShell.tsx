"use client";

/**
 * @file Layout shell arranging sidebar, header, and main content for each page.
 * @remarks Keep structural markup stable so backend-driven pages can slot in without layout regressions.
 */
import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export const PageShell = ({ children, className }: PageShellProps) => {
  const toast = useUIStore((state) => state.toast);
  const setToast = useUIStore((state) => state.setToast);

  const toastIcon = (() => {
    if (!toast) return null;
    if (toast.tone === "success") return <CheckCircle2 className="h-4 w-4" aria-hidden />;
    if (toast.tone === "error") return <AlertCircle className="h-4 w-4" aria-hidden />;
    return <Info className="h-4 w-4" aria-hidden />;
  })();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className={cn("flex flex-1 flex-col overflow-y-auto px-6 py-6", className)}>
          {children}
        </main>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 right-6 flex w-80 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
          {toastIcon}
          <p className="text-sm text-foreground">{toast.message}</p>
          <button
            type="button"
            className="pointer-events-auto ml-auto text-xs text-muted-foreground underline"
            onClick={() => setToast(null)}
          >
            {t("toast.dismiss", "閉じる")}
          </button>
        </div>
      ) : null}
    </div>
  );
};
