import { describe, expect, it } from "vitest";

import { HERO_LOGO_MODEL_URL, preloadHeroLogo } from "@/lib/heroLogo";

describe("heroLogo", () => {
  it("points at the seeded corvo preview GLB", () => {
    expect(HERO_LOGO_MODEL_URL).toBe("/models/3d/corvo-logo-preview.glb?v=4");
  });

  it("deduplicates preload requests", async () => {
    const first = preloadHeroLogo();
    const second = preloadHeroLogo();
    expect(first).toBe(second);
    await first;
  });
});
