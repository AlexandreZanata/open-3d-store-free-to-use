import { describe, expect, it } from "vitest";

import {
  isGeometryTooHeavyForViewer,
  isModelFileTooLargeForViewer,
  MAX_VIEWER_FILE_BYTES,
  MAX_VIEWER_VERTEX_COUNT,
} from "@/lib/modelViewerLimits";

/** Contract: docs/features/3d-viewer.md — browser preview size limits */
describe("modelViewerLimits", () => {
  it("blocks files above 20 MB before loading in Three.js", () => {
    expect(isModelFileTooLargeForViewer(MAX_VIEWER_FILE_BYTES)).toBe(false);
    expect(isModelFileTooLargeForViewer(MAX_VIEWER_FILE_BYTES + 1)).toBe(true);
    expect(isModelFileTooLargeForViewer(72 * 1024 * 1024)).toBe(true);
  });

  it("blocks meshes above vertex budget after STL parse", () => {
    expect(isGeometryTooHeavyForViewer(MAX_VIEWER_VERTEX_COUNT)).toBe(false);
    expect(isGeometryTooHeavyForViewer(MAX_VIEWER_VERTEX_COUNT + 1)).toBe(true);
  });
});
