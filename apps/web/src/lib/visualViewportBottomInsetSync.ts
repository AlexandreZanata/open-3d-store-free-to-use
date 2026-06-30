import {
  pickStableBottomInsetPx,
  readVisualViewportBottomInsetPx,
} from "@/lib/visualViewportInset";

const CSS_VAR = "--vv-bottom-inset";
const SETTLE_MS = 120;

/** Wires visualViewport listeners; returns dispose. */
export function attachVisualViewportBottomInsetSync(
  root: HTMLElement,
  mq: MediaQueryList,
): () => void {
  let rafId = 0;
  let settleId = 0;
  let displayedInset = 0;

  const applyInset = (px: number) => {
    displayedInset = px;
    root.style.setProperty(CSS_VAR, `${px}px`);
  };

  const readMeasured = () => {
    if (!mq.matches) {
      return 0;
    }
    return readVisualViewportBottomInsetPx(window.innerHeight, window.visualViewport);
  };

  const settleToMeasured = () => {
    settleId = 0;
    applyInset(readMeasured());
  };

  const scheduleSettle = () => {
    if (settleId !== 0) {
      window.clearTimeout(settleId);
    }
    settleId = window.setTimeout(settleToMeasured, SETTLE_MS);
  };

  const syncNow = () => {
    if (!mq.matches) {
      applyInset(0);
      return;
    }
    applyInset(pickStableBottomInsetPx(displayedInset, readMeasured()));
    scheduleSettle();
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

  syncNow();
  mq.addEventListener("change", scheduleSync);
  window.addEventListener("resize", scheduleSync);
  window.visualViewport?.addEventListener("resize", scheduleSync);
  window.visualViewport?.addEventListener("scroll", scheduleSync);

  return () => {
    if (rafId !== 0) {
      window.cancelAnimationFrame(rafId);
    }
    if (settleId !== 0) {
      window.clearTimeout(settleId);
    }
    mq.removeEventListener("change", scheduleSync);
    window.removeEventListener("resize", scheduleSync);
    window.visualViewport?.removeEventListener("resize", scheduleSync);
    window.visualViewport?.removeEventListener("scroll", scheduleSync);
    root.style.removeProperty(CSS_VAR);
  };
}
