/** Draco GLB for the desktop home hero (seeded from corvo STL). */
import { loadHeroGltfCached } from "@/lib/heroLogoGltfCache";

export const HERO_LOGO_MODEL_URL = "/models/3d/corvo-logo-preview.glb?v=4";

let preloadPromise: Promise<void> | null = null;

/** Warm the hero GLB and Three.js scene module (safe to call multiple times). */
export function preloadHeroLogo(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  preloadPromise ??= Promise.all([
    import("@/components/home/heroLogoScene"),
    fetch(HERO_LOGO_MODEL_URL, { cache: "force-cache" }).then((response) => {
      if (!response.ok) {
        throw new Error(`hero GLB ${response.status}`);
      }
    }),
    loadHeroGltfCached(HERO_LOGO_MODEL_URL),
    import("@/lib/heroLogoViewerHost").then((module) => module.warmHeroLogoViewerHost()),
  ])
    .then(() => undefined)
    .catch(() => undefined);
  return preloadPromise;
}
