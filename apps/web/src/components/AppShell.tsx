import type { ReactNode } from "react";

import { CatalogRealtimeListener } from "@/components/CatalogRealtimeListener";
import { AppShellDesktopHeader } from "@/components/AppShellDesktopHeader";
import { AppShellFooter } from "@/components/AppShellFooter";
import { AppShellMobileHeader } from "@/components/AppShellMobileHeader";
import { AppShellMobileNav } from "@/components/AppShellMobileNav";
import { useVisualViewportBottomInset } from "@/hooks/useVisualViewportBottomInset";
import { desktopMainSurface, mainBottomPad, mobileTopPad, shellMaxWidth } from "@/lib/layout";

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
  useVisualViewportBottomInset();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground lg:bg-surface-muted/40">
      <CatalogRealtimeListener />
      {showTopBar && (
        <>
          <AppShellMobileHeader {...headerProps} />
          <AppShellDesktopHeader {...headerProps} />
        </>
      )}

      <main
        className={`flex-1 ${shellMaxWidth} ${showTopBar ? mobileTopPad : ""} ${mainBottomPad} ${desktopMainSurface}`}
      >
        {children}
      </main>

      <AppShellFooter />
      <AppShellMobileNav />
    </div>
  );
}
