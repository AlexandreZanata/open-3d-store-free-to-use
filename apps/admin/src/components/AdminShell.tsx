import { useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { useAdminAuth } from "@/auth/useAdminAuth";
import { AdminBrand, AdminNavLinks } from "@/components/AdminNavLinks";
import { Button } from "@/components/ui/Button";
import { ADMIN_APP_TITLE } from "@/lib/brand";
import { adminTokens } from "@/lib/admin-tokens";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const { user, logout } = useAdminAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

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
        <AdminBrand />
        <AdminNavLinks className="flex-1 p-3" />
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-[min(100%,18rem)] flex-col bg-surface shadow-lg">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <span className="text-sm font-semibold text-foreground">Menu</span>
              <Button
                type="button"
                variant="ghost"
                aria-label="Close menu"
                onClick={() => setMobileNavOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <AdminBrand />
            <AdminNavLinks className="flex-1 p-3" onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-hairline bg-surface px-4 py-3 md:justify-end md:px-6 md:py-4">
          <Button
            type="button"
            variant="ghost"
            className="md:hidden"
            aria-expanded={mobileNavOpen}
            aria-label="Open navigation menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0 flex-1 md:hidden">
            <p className="truncate text-sm font-semibold text-foreground">{ADMIN_APP_TITLE}</p>
            {user?.email ? (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            ) : null}
          </div>
          <span className="hidden text-sm text-muted-foreground sm:inline md:ml-auto">{user?.email}</span>
          <Button variant="ghost" onClick={() => void handleLogout()}>
            <LogOut className="size-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </header>
        <main className="flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-6 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
