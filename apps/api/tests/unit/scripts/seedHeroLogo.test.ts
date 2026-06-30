/**
 * Contract: docs/features/3d-viewer.md — hero logo bundled GLB for VPS seed
 */
import { access, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  BUNDLED_HERO_GLB,
  HERO_LOGO_PREVIEW_URL,
  installBundledHeroLogoGlb,
} from "../../../scripts/seedHeroLogo.js";

describe("seedHeroLogo bundled asset", () => {
  it("ships corvo-logo-preview.glb under seed-assets/hero", async () => {
    await expect(access(BUNDLED_HERO_GLB)).resolves.toBeUndefined();
  });

  it("installs bundled GLB to MODEL_FILES_BASE_PATH/3d", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "print3d-hero-"));
    const url = await installBundledHeroLogoGlb(base);
    expect(url).toBe(HERO_LOGO_PREVIEW_URL);
    await expect(access(path.join(base, "3d", "corvo-logo-preview.glb"))).resolves.toBeUndefined();
  });
});
