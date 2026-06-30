import { useEffect, useState } from "react";

/** Mobile tab bar height — matches `AppShellMobileNav` (`h-[3.75rem]`). */
const MOBILE_TAB_BAR_PX = 60;
/** Sticky product actions bar height including padding. */
const STICKY_ACTIONS_PX = 68;

function readSafeAreaBottomPx(): number {
  if (typeof document === "undefined") {
    return 0;
  }
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;bottom:0;padding-bottom:env(safe-area-inset-bottom,0px);visibility:hidden;pointer-events:none";
  document.documentElement.appendChild(probe);
  const px = Number.parseFloat(getComputedStyle(probe).paddingBottom) || 0;
  probe.remove();
  return px;
}

function readVvBottomInsetPx(): number {
  if (typeof document === "undefined") {
    return 0;
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--vv-bottom-inset").trim();
  return Number.parseFloat(raw) || 0;
}

function footerOverlapsStickyZone(footerTop: number, footerBottom: number, innerHeight: number): boolean {
  const stickyZoneTop =
    innerHeight -
    MOBILE_TAB_BAR_PX -
    STICKY_ACTIONS_PX -
    readSafeAreaBottomPx() -
    readVvBottomInsetPx();
  return footerTop < innerHeight && footerBottom > stickyZoneTop;
}

/** True when the site footer enters the viewport (mobile sticky bars should yield). */
export function useFooterInView(): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('[role="contentinfo"]');
    if (!footer) {
      return;
    }

    const readFooterVisible = () => {
      const rect = footer.getBoundingClientRect();
      setInView(footerOverlapsStickyZone(rect.top, rect.bottom, window.innerHeight));
    };

    const onViewportChange = () => {
      readFooterVisible();
    };

    readFooterVisible();
    window.addEventListener("scroll", readFooterVisible, { passive: true });
    document.addEventListener("scroll", readFooterVisible, { passive: true });
    window.addEventListener("resize", onViewportChange);
    window.visualViewport?.addEventListener("resize", onViewportChange);
    window.visualViewport?.addEventListener("scroll", onViewportChange);
    return () => {
      window.removeEventListener("scroll", readFooterVisible);
      document.removeEventListener("scroll", readFooterVisible);
      window.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("scroll", onViewportChange);
    };
  }, []);

  return inView;
}
