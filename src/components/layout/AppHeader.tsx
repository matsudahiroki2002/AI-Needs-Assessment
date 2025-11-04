"use client";

/**
 * @file Application header containing global search, notifications, and theme toggle affordances.
 * @remarks Preserve statelessness aside from light local UI to simplify future replacement with real user settings.
 */
import { Settings, Sun, MoonStar, Bell, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { t } from "@/lib/i18n";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  className?: string;
};

export const AppHeader = ({ className }: AppHeaderProps) => {
  const filters = useUIStore((state) => state.filters);
  const setFilters = useUIStore((state) => state.setFilters);
  const [searchValue, setSearchValue] = useState(filters.search ?? "");
  const [isDark, setIsDark] = useState(false);

  const placeholder = useMemo(
    () => t("header.searchPlaceholder", "AI案・セグメントを検索"),
    []
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters({ search: searchValue });
  };

  return (
    <header
      className={cn(
        "flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur",
        className
      )}
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full max-w-xl items-center gap-3"
        role="search"
      >
        <Search
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label={t("header.searchLabel", "グローバル検索")}
          className="pl-11"
          placeholder={placeholder}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
        <Button type="submit" size="sm">
          {t("header.searchAction", "検索")}
        </Button>
      </form>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Switch
            aria-label={t("header.themeToggle", "ダークテーマ切替")}
            checked={isDark}
            onChange={(event) => setIsDark(event.target.checked)}
          />
          <MoonStar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <Button variant="ghost" size="icon" aria-label={t("header.notifications", "通知")}>
          <Bell className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="sm" icon={<Settings className="h-4 w-4" />}>
          {t("header.settings", "設定")}
        </Button>
      </div>
    </header>
  );
};
