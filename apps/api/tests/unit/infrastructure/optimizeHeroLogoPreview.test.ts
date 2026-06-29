import { describe, expect, it } from "vitest";

import {
  HERO_LOGO_READ_MAX_TRIANGLES,
  HERO_LOGO_SIMPLIFY_RATIO,
} from "../../../src/infrastructure/model/optimizeHeroLogoPreview.js";

describe("optimizeHeroLogoPreview constants", () => {
  it("reads enough STL triangles to avoid sparse stride artifacts", () => {
    expect(HERO_LOGO_READ_MAX_TRIANGLES).toBeGreaterThanOrEqual(500_000);
  });

  it("keeps a moderate simplify ratio for solid welded meshes", () => {
    expect(HERO_LOGO_SIMPLIFY_RATIO).toBeGreaterThan(0.08);
    expect(HERO_LOGO_SIMPLIFY_RATIO).toBeLessThan(0.25);
  });
});
