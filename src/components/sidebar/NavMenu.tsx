"use client";

import { Gauge, Lightbulb, Users, BookOpen, FlaskConical, FileBarChart2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";

const NAV_ITEMS = [
  { href: "dashboard", label: "ダッシュボード", icon: Gauge },
  { href: "ideas", label: "案一覧", icon: Lightbulb },
  { href: "personas", label: "ペルソナ", icon: Users },
  { href: "rag", label: "RAGソース", icon: BookOpen },
  { href: "simulation", label: "シミュレーション", icon: FlaskConical },
  { href: "report", label: "レポート", icon: FileBarChart2 }
] as const;

export const NavMenu = () => {
  const pathname = usePathname();
  const { currentProject } = useProjectStore();

  return (
    <nav aria-label="主要ナビゲーション" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const href = `/${currentProject}/${item.href}`;
        const isActive = pathname.startsWith(href);

        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
              isActive ? "bg-accent/20 text-primary" : "text-muted-foreground hover:bg-accent/10"
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
