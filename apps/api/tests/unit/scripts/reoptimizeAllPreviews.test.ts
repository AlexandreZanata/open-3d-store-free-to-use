/**
 * Contract: docs/infrastructure/deployment.md — deploy must not fail on empty models/3d
 */
import { access, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { ensureModelStorageDirs } from "../../../scripts/reoptimizeAllPreviews.js";

describe("ensureModelStorageDirs", () => {
  it("creates 3d, thumbnails, and images under MODEL_FILES_BASE_PATH", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "print3d-models-"));
    const models3d = await ensureModelStorageDirs(base);
    expect(models3d).toBe(path.join(base, "3d"));
    await expect(access(path.join(base, "3d"))).resolves.toBeUndefined();
    await expect(access(path.join(base, "thumbnails"))).resolves.toBeUndefined();
    await expect(access(path.join(base, "images"))).resolves.toBeUndefined();
  });
});
