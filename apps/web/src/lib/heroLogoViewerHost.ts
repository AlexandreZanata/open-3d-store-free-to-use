import type { HeroLogoHandle } from "@/components/home/heroLogoScene";
import { HERO_LOGO_MODEL_URL } from "@/lib/heroLogo";

const PARKED_SIZE_PX = 280;

let viewer: HeroLogoHandle | null = null;
let parkedHost: HTMLDivElement | null = null;
let ready = false;
let activeShell: HTMLElement | null = null;
const readyListeners = new Set<(isReady: boolean) => void>();

function notifyReady() {
  for (const listener of readyListeners) {
    listener(true);
  }
}

function ensureParkedHost(): HTMLDivElement {
  if (!parkedHost) {
    parkedHost = document.createElement("div");
    parkedHost.setAttribute("aria-hidden", "true");
    parkedHost.style.cssText =
      "position:fixed;left:-10000px;top:0;width:280px;height:280px;overflow:hidden;visibility:hidden;pointer-events:none;";
    document.body.appendChild(parkedHost);
  }
  return parkedHost;
}

async function ensureViewer(): Promise<HeroLogoHandle> {
  if (viewer) {
    return viewer;
  }

  const host = ensureParkedHost();
  const { mountHeroLogoViewer } = await import("@/components/home/heroLogoScene");
  viewer = mountHeroLogoViewer(host, {
    modelUrl: HERO_LOGO_MODEL_URL,
    skipProbe: true,
    onReady: () => {
      ready = true;
      notifyReady();
    },
  });
  return viewer;
}

export function isHeroLogoReady(): boolean {
  return ready;
}

export function subscribeHeroLogoReady(listener: (isReady: boolean) => void): () => void {
  if (ready) {
    listener(true);
  }
  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
}

/** Warm singleton viewer — keeps spinning off-screen after first home visit. */
export function warmHeroLogoViewerHost(): Promise<void> {
  return ensureViewer().then(() => undefined);
}

export function isHeroLogoSlotVisible(shell: HTMLElement): boolean {
  if (shell.clientWidth === 0 || shell.clientHeight === 0) {
    return false;
  }
  const style = getComputedStyle(shell);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }
  return shell.getClientRects().length > 0;
}

function parkViewer(handle: HeroLogoHandle): void {
  const host = ensureParkedHost();
  handle.reparentTo(host);
  host.style.width = `${PARKED_SIZE_PX}px`;
  host.style.height = `${PARKED_SIZE_PX}px`;
}

function releaseSlot(shell: HTMLElement): void {
  if (activeShell !== shell) {
    return;
  }
  activeShell = null;
  if (viewer) {
    parkViewer(viewer);
  }
}

export function attachHeroLogoSlot(shell: HTMLElement, container: HTMLElement): () => void {
  let cancelled = false;
  let isActive = false;

  const tryAttach = () => {
    if (cancelled) {
      return;
    }
    if (!isHeroLogoSlotVisible(shell)) {
      if (isActive) {
        isActive = false;
        releaseSlot(shell);
      }
      return;
    }

    void ensureViewer().then((handle) => {
      if (cancelled || !isHeroLogoSlotVisible(shell)) {
        return;
      }
      handle.reparentTo(container);
      isActive = true;
      activeShell = shell;
    });
  };

  tryAttach();

  const resizeObserver = new ResizeObserver(tryAttach);
  resizeObserver.observe(shell);

  const intersectionObserver = new IntersectionObserver(tryAttach, {
    threshold: 0,
    rootMargin: "64px 0px",
  });
  intersectionObserver.observe(shell);

  return () => {
    cancelled = true;
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    if (isActive) {
      isActive = false;
      releaseSlot(shell);
    }
  };
}

export function resetHeroLogoViewerHostForTests(): void {
  viewer?.dispose();
  viewer = null;
  parkedHost?.remove();
  parkedHost = null;
  ready = false;
  activeShell = null;
  readyListeners.clear();
}
