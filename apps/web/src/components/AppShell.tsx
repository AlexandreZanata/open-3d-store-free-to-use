import type { ReactNode } from "react";

import { CatalogRealtimeListener } from "@/components/CatalogRealtimeListener";
import { AppShellDesktopHeader } from "@/components/AppShellDesktopHeader";
import { AppShellMobileHeader } from "@/components/AppShellMobileHeader";
import { AppShellMobileNav } from "@/components/AppShellMobileNav";
import { desktopMainSurface, mainBottomPad, shellMaxWidth } from "@/lib/layout";

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
  const headerProps = { showSearch, showBack, title };

  return (
    <div className="min-h-dvh bg-background text-foreground lg:bg-surface-muted/40">
      <CatalogRealtimeListener />
      {showTopBar && (
        <>
          <AppShellMobileHeader {...headerProps} />
          <AppShellDesktopHeader {...headerProps} />
        </>
      )}

      <main className={`${shellMaxWidth} ${mainBottomPad} ${desktopMainSurface}`}>{children}</main>

      <AppShellMobileNav />
    </div>
  );
}
