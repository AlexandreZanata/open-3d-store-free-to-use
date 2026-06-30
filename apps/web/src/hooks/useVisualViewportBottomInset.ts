import { useEffect } from "react";

import { attachVisualViewportBottomInsetSync } from "@/lib/visualViewportBottomInsetSync";
import { MOBILE_VIEWPORT_MQ } from "@/lib/layout";

/** Syncs mobile browser chrome gap to `--vv-bottom-inset` (Android scroll-up gap fix). */
export function useVisualViewportBottomInset(): void {
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_VIEWPORT_MQ);
    return attachVisualViewportBottomInsetSync(document.documentElement, mq);
  }, []);
}
