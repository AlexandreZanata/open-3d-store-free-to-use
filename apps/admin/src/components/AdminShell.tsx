import { Link, useRouterState } from "@tanstack/react-router";
import {
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { type ReactNode } from "react";

import { useAdminAuth } from "@/auth/useAdminAuth";
import { Button } from "@/components/ui/Button";
import { adminTokens } from "@/lib/admin-tokens";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: FolderTree },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const { user, logout } = useAdminAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  async function handleLogout() {
    await logout();
    window.location.assign("/login");
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside
        className={cn(
          "hidden shrink-0 border-r border-hairline bg-surface md:flex md:flex-col",
          adminTokens.sidebarWidth,
        )}
      >
        <div className="border-b border-hairline px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            AXIS
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  adminTokens.sidebarItem,
                  active && adminTokens.sidebarActive,
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-hairline bg-surface px-4 py-4 md:px-6">
          <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
          <Button variant="ghost" onClick={() => void handleLogout()}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </header>
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
