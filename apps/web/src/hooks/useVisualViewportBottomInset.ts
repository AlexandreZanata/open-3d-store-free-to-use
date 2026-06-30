import { useEffect } from "react";

import { readVisualViewportBottomInsetPx } from "@/lib/visualViewportInset";

const CSS_VAR = "--vv-bottom-inset";
const MOBILE_MQ = "(max-width: 1023px)";

/** Syncs mobile browser chrome gap to `--vv-bottom-inset` (Android scroll-up gap fix). */
export function useVisualViewportBottomInset(): void {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia(MOBILE_MQ);
    let rafId = 0;

    const applyInset = (px: number) => {
      root.style.setProperty(CSS_VAR, `${px}px`);
    };

    const syncNow = () => {
      if (!mq.matches) {
        applyInset(0);
        return;
      }
      applyInset(
        readVisualViewportBottomInsetPx(window.innerHeight, window.visualViewport),
      );
    };

    const scheduleSync = () => {
      if (rafId !== 0) {
        return;
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        syncNow();
      });
    };

    const onMqChange = () => {
      syncNow();
    };

    syncNow();
    mq.addEventListener("change", onMqChange);
    window.visualViewport?.addEventListener("resize", scheduleSync);
    window.visualViewport?.addEventListener("scroll", scheduleSync);
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("scroll", scheduleSync, { passive: true });

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      mq.removeEventListener("change", onMqChange);
      window.visualViewport?.removeEventListener("resize", scheduleSync);
      window.visualViewport?.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("scroll", scheduleSync);
      root.style.removeProperty(CSS_VAR);
    };
  }, []);
}
