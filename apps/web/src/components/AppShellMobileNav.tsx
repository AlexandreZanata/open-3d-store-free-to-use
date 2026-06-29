import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, Search, User, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { mobileOnly, shellMaxWidth } from "@/lib/layout";
import { cn } from "@/lib/utils";

const TABS: Array<{ to: string; labelKey: string; icon: LucideIcon; match: (path: string) => boolean }> = [
  { to: "/", labelKey: "nav.home", icon: Home, match: (path) => path === "/" },
  { to: "/search", labelKey: "nav.search", icon: Search, match: (path) => path.startsWith("/search") },
  {
    to: "/categories",
    labelKey: "nav.categories",
    icon: LayoutGrid,
    match: (path) => path.startsWith("/categories"),
  },
  {
    to: "/favorites",
    labelKey: "nav.favorites",
    icon: Heart,
    match: (path) => path.startsWith("/favorites"),
  },
  { to: "/profile", labelKey: "nav.profile", icon: User, match: (path) => path.startsWith("/profile") },
];

export function AppShellMobileNav() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className={`${mobileOnly} fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-t border-hairline pb-[max(0px,env(safe-area-inset-bottom))]`}
    >
      <div className={`${shellMaxWidth} px-1.5 h-[3.75rem] grid grid-cols-5`}>
        {TABS.map(({ to, labelKey, icon: Icon, match }) => (
          <TabItem
            key={to}
            to={to}
            active={match(pathname)}
            icon={Icon}
            label={t(labelKey)}
          />
        ))}
      </div>
    </nav>
  );
}

function TabItem({
  to,
  active,
  icon: Icon,
  label,
}: {
  to: string;
  active: boolean;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-1 press",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <Icon
        className="size-5"
        fill={active ? "currentColor" : "none"}
        strokeWidth={active ? 0 : 2}
        aria-hidden
      />
      <span
        className={cn(
          "text-[10px] tracking-tight leading-none",
          active ? "font-semibold" : "font-medium",
        )}
      >
        {label}
      </span>
    </Link>
  );
}
