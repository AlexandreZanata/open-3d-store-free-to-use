import { readVisualViewportBottomInsetPx } from "@/lib/visualViewportInset";

const CSS_VAR = "--vv-bottom-inset";
const SETTLE_MS = 120;

/** Wires visualViewport listeners; returns dispose. */
export function attachVisualViewportBottomInsetSync(
  root: HTMLElement,
  mq: MediaQueryList,
): () => void {
  let rafId = 0;
  let settleId = 0;

  const applyInset = (px: number) => {
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

  const syncImmediate = () => {
    if (!mq.matches) {
      applyInset(0);
      return;
    }
    applyInset(readMeasured());
    scheduleSettle();
  };

  /** Defer inset changes while the toolbar animates — prevents tab bar jump mid-scroll. */
  const deferInsetUntilIdle = () => {
    if (!mq.matches) {
      return;
    }
    scheduleSettle();
  };

  const scheduleDefer = () => {
    if (rafId !== 0) {
      return;
    }
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      deferInsetUntilIdle();
    });
  };

  syncImmediate();
  mq.addEventListener("change", syncImmediate);
  window.addEventListener("resize", scheduleDefer);
  window.visualViewport?.addEventListener("resize", scheduleDefer);
  window.visualViewport?.addEventListener("scroll", scheduleDefer);

  return () => {
    if (rafId !== 0) {
      window.cancelAnimationFrame(rafId);
    }
    if (settleId !== 0) {
      window.clearTimeout(settleId);
    }
    mq.removeEventListener("change", syncImmediate);
    window.removeEventListener("resize", scheduleDefer);
    window.visualViewport?.removeEventListener("resize", scheduleDefer);
    window.visualViewport?.removeEventListener("scroll", scheduleDefer);
    root.style.removeProperty(CSS_VAR);
  };
}
