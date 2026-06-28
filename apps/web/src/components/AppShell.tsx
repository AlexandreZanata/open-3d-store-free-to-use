import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingBag, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { AppShellDesktopNav } from "@/components/AppShellDesktopNav";
import { AppShellMobileNav } from "@/components/AppShellMobileNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { mainBottomPad, pagePadding, shellMaxWidth } from "@/lib/layout";

type Props = {
  children: ReactNode;
  showTopBar?: boolean;
  showSearch?: boolean;
  showBack?: boolean;
  title?: string;
};

export function AppShell({
  children,
  showTopBar = true,
  showSearch = true,
  showBack = false,
  title,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {showTopBar && (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-hairline">
          <div
            className={`${shellMaxWidth} ${pagePadding} h-14 lg:h-16 flex items-center gap-3 lg:gap-4`}
          >
            {showBack ? (
              <Link
                to="/"
                aria-label={t("nav.back")}
                className="-ml-2 size-9 grid place-items-center rounded-full hover:bg-muted press"
              >
                <ArrowLeft className="size-5" />
              </Link>
            ) : (
              <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={t("nav.home")}>
                <span className="size-7 grid place-items-center rounded-md bg-foreground text-background">
                  <span className="block size-2 border border-background" />
                </span>
                <span className="text-sm font-semibold tracking-tight">{t("app.name")}</span>
              </Link>
            )}

            <AppShellDesktopNav />

            {title ? (
              <h1 className="flex-1 min-w-0 truncate text-sm font-semibold tracking-tight lg:text-base">
                {title}
              </h1>
            ) : showSearch ? (
              <Link
                to="/search"
                className="flex-1 min-w-0 flex items-center gap-2 bg-muted rounded-full h-9 lg:h-10 px-3.5 text-muted-foreground press max-w-xl lg:mx-auto"
              >
                <Search className="size-4 shrink-0" />
                <span className="truncate text-sm">{t("nav.searchPlaceholder")}</span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            <LanguageSwitcher />

            <Link
              to="/cart"
              aria-label={t("nav.cart")}
              className="relative size-9 grid place-items-center rounded-full hover:bg-muted press"
            >
              <ShoppingBag className="size-5" />
            </Link>
          </div>
        </header>
      )}

      <main className={`${shellMaxWidth} ${mainBottomPad}`}>{children}</main>

      <AppShellMobileNav />
    </div>
  );
}
