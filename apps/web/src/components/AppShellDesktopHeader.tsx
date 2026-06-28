import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { desktopOnly, shellMaxWidth } from "@/lib/layout";

type Props = {
  showSearch?: boolean;
  showBack?: boolean;
  title?: string;
};

const NAV_ITEMS = [
  { to: "/", match: (path: string) => path === "/", icon: Home, key: "home" },
  {
    to: "/search",
    match: (path: string) => path.startsWith("/search"),
    icon: Search,
    key: "search",
  },
  {
    to: "/categories",
    match: (path: string) => path.startsWith("/categories"),
    icon: LayoutGrid,
    key: "categories",
  },
  {
    to: "/favorites",
    match: (path: string) => path.startsWith("/favorites"),
    icon: Heart,
    key: "favorites",
  },
  {
    to: "/profile",
    match: (path: string) => path.startsWith("/profile"),
    icon: User,
    key: "profile",
  },
] as const;

/** Desktop-only header — inverted bar and utility strip. */
export function AppShellDesktopHeader({
  showSearch = true,
  title,
}: Props) {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className={`${desktopOnly} sticky top-0 z-40`}>
      <div className="border-b border-hairline bg-surface-muted/80">
        <div
          className={`${shellMaxWidth} px-8 h-9 flex items-center justify-between text-[11px] text-muted-foreground`}
        >
          <p className="tracking-wide">
            {t("app.tagline")} · {t("desktop.orderViaWhatsApp")}
          </p>
          <LanguageSwitcher tone="muted" />
        </div>
      </div>

      <div className="bg-foreground text-background shadow-[0_8px_30px_oklch(0_0_0/0.12)]">
        <div className={`${shellMaxWidth} px-8 h-[4.25rem] flex items-center gap-10`}>
          <Link to="/" className="flex items-center gap-3 shrink-0 group" aria-label={t("nav.home")}>
            <span className="size-9 grid place-items-center rounded-lg bg-background text-foreground transition-transform group-hover:scale-105">
              <span className="block size-2.5 border-2 border-foreground" />
            </span>
            <span className="text-lg font-semibold tracking-tight">{t("app.name")}</span>
          </Link>

          <nav className="flex items-center gap-1" aria-label={t("nav.main")}>
            {NAV_ITEMS.map(({ to, match, icon: Icon, key }) => {
              const active = match(pathname);
              return (
                <Link
                  key={key}
                  to={to}
                  className={`relative inline-flex items-center gap-2 h-10 px-4 text-sm font-medium transition-colors ${
                    active ? "text-background" : "text-background/65 hover:text-background"
                  }`}
                >
                  <Icon className="size-4" />
                  {t(`nav.${key}`)}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[1.125rem] h-0.5 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {showSearch && !title && (
              <Link
                to="/search"
                className="flex items-center gap-2.5 h-10 w-56 xl:w-72 px-4 rounded-lg bg-background/10 ring-1 ring-background/15 text-background/70 hover:bg-background/15 hover:text-background transition-colors press"
              >
                <Search className="size-4 shrink-0" />
                <span className="text-sm">{t("nav.searchPlaceholder")}</span>
              </Link>
            )}
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-background text-foreground text-sm font-semibold press hover:bg-background/90"
            >
              <ShoppingBag className="size-4" />
              {t("nav.cart")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
