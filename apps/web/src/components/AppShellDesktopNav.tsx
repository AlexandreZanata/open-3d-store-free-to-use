import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, Search, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import { desktopOnly } from "@/lib/layout";

export function AppShellDesktopNav() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className={`${desktopOnly} items-center gap-1 shrink-0`} aria-label={t("nav.main")}>
      <DesktopNavItem
        to="/"
        active={pathname === "/"}
        icon={<Home className="size-4" />}
        label={t("nav.home")}
      />
      <DesktopNavItem
        to="/search"
        active={pathname.startsWith("/search")}
        icon={<Search className="size-4" />}
        label={t("nav.search")}
      />
      <DesktopNavItem
        to="/categories"
        active={pathname.startsWith("/categories")}
        icon={<LayoutGrid className="size-4" />}
        label={t("nav.categories")}
      />
      <DesktopNavItem
        to="/favorites"
        active={pathname.startsWith("/favorites")}
        icon={<Heart className="size-4" />}
        label={t("nav.favorites")}
      />
      <DesktopNavItem
        to="/profile"
        active={pathname.startsWith("/profile")}
        icon={<User className="size-4" />}
        label={t("nav.profile")}
      />
    </nav>
  );
}

function DesktopNavItem({
  to,
  active,
  icon,
  label,
}: {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 h-9 px-3 rounded-full text-sm font-medium press ${
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
