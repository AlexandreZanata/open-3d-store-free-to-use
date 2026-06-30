import { describe, expect, it } from "vitest";

import {
  HERO_LOGO_READ_MAX_TRIANGLES,
  HERO_LOGO_SIMPLIFY_RATIO,
} from "../../../src/infrastructure/model/optimizeHeroLogoPreview.js";

describe("optimizeHeroLogoPreview constants", () => {
  it("reads the full STL without stride decimation", () => {
    expect(HERO_LOGO_READ_MAX_TRIANGLES).toBe(Number.POSITIVE_INFINITY);
  });

  it("keeps a moderate simplify ratio for solid welded meshes", () => {
    expect(HERO_LOGO_SIMPLIFY_RATIO).toBeGreaterThan(0.15);
    expect(HERO_LOGO_SIMPLIFY_RATIO).toBeLessThan(0.35);
  });
});
