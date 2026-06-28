import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingBag, Home, LayoutGrid, Heart, User, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {showTopBar && (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-hairline">
          <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
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

            {title ? (
              <h1 className="flex-1 min-w-0 truncate text-sm font-semibold tracking-tight">
                {title}
              </h1>
            ) : showSearch ? (
              <Link
                to="/search"
                className="flex-1 min-w-0 flex items-center gap-2 bg-muted rounded-full h-9 px-3.5 text-muted-foreground press"
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

      <main className="mx-auto max-w-2xl pb-24">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-hairline">
        <div className="mx-auto max-w-2xl px-2 h-16 grid grid-cols-5">
          <TabItem
            to="/"
            active={pathname === "/"}
            icon={<Home className="size-5" />}
            label={t("nav.home")}
          />
          <TabItem
            to="/search"
            active={pathname.startsWith("/search")}
            icon={<Search className="size-5" />}
            label={t("nav.search")}
          />
          <TabItem
            to="/categories"
            active={pathname.startsWith("/categories")}
            icon={<LayoutGrid className="size-5" />}
            label={t("nav.categories")}
          />
          <TabItem
            to="/favorites"
            active={pathname.startsWith("/favorites")}
            icon={<Heart className="size-5" />}
            label={t("nav.favorites")}
          />
          <TabItem
            to="/profile"
            active={pathname.startsWith("/profile")}
            icon={<User className="size-5" />}
            label={t("nav.profile")}
          />
        </div>
      </nav>
    </div>
  );
}

function TabItem({
  to,
  active,
  icon,
  label,
}: {
  to: string;
  active: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 press ${
        active ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      <span className="relative grid place-items-center">
        {icon}
        {active && <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-accent" />}
      </span>
      <span className="text-[10px] font-medium tracking-tight">{label}</span>
    </Link>
  );
}
