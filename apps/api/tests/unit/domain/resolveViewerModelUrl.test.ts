import { describe, expect, it } from "vitest";

import {
  previewUrlForSource,
  resolveViewerModelUrl,
} from "../../../src/domain/services/resolveViewerModelUrl.js";

/** Contract: docs/features/3d-viewer.md */
describe("resolveViewerModelUrl", () => {
  it("maps source STL path to preview GLB sibling name", () => {
    expect(previewUrlForSource("/models/3d/part.stl")).toBe(
      "/models/3d/part-preview.glb",
    );
  });

  it("returns preview URL when sibling file exists on disk", async () => {
    const modelsBase = "/tmp/print3d-models-test";
    const { mkdir, writeFile, rm } = await import("node:fs/promises");
    await mkdir(`${modelsBase}/3d`, { recursive: true });
    await writeFile(`${modelsBase}/3d/big-preview.glb`, "glb");

    const resolved = await resolveViewerModelUrl(
      "/models/3d/big.stl",
      modelsBase,
    );
    expect(resolved).toBe("/models/3d/big-preview.glb");

    await rm(modelsBase, { recursive: true, force: true });
  });

  it("falls back to source when no preview file exists", async () => {
    const resolved = await resolveViewerModelUrl(
      "/models/3d/missing.stl",
      "/tmp/does-not-exist-print3d",
    );
    expect(resolved).toBe("/models/3d/missing.stl");
  });
});
