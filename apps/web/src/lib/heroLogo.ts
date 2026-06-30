/** Draco GLB for the desktop home hero (seeded from corvo STL). */
import { loadHeroGltfCached } from "@/lib/heroLogoGltfCache";

export const HERO_LOGO_MODEL_URL = "/models/3d/corvo-logo-preview.glb?v=4";

let preloadPromise: Promise<void> | null = null;

/** Warm the hero GLB and Three.js scene module (safe to call multiple times). */
export function preloadHeroLogo(): Promise<void> {
  preloadPromise ??= Promise.all([
    import("@/components/home/heroLogoScene"),
    typeof window !== "undefined"
      ? Promise.all([
          fetch(HERO_LOGO_MODEL_URL, { cache: "force-cache" }),
          loadHeroGltfCached(HERO_LOGO_MODEL_URL),
        ])
      : Promise.resolve(),
  ]).then(() => undefined);
  return preloadPromise;
}
