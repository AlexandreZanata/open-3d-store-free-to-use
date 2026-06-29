import { access } from "node:fs/promises";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { seedAssets } from "../../../scripts/seedAssets.js";
import { seedThumbnailSpecs } from "../../../scripts/seedThumbnailSpecs.js";

describe("seedAssets (contract)", () => {
  let tempDir: string;

  afterAll(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("copies all catalog thumbnails into MODEL_FILES_BASE_PATH/thumbnails", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "print3d-seed-assets-"));
    await seedAssets({
      ...process.env,
      NODE_ENV: "test",
      MODEL_FILES_BASE_PATH: tempDir,
    });

    await Promise.all(
      seedThumbnailSpecs.map((spec) =>
        access(path.join(tempDir, "thumbnails", spec.fileName)),
      ),
    );

    expect(seedThumbnailSpecs.length).toBeGreaterThanOrEqual(8);
  });
});
