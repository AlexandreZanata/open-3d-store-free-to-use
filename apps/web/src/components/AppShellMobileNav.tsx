import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, Search, User } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { mobileOnly, shellMaxWidth } from "@/lib/layout";

export function AppShellMobileNav() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className={`${mobileOnly} fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-hairline`}
    >
      <div className={`${shellMaxWidth} px-2 h-16 grid grid-cols-5`}>
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
