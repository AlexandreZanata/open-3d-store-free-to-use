import { describe, expect, it } from "vitest";

import { orientBambuBuildPlateForPreview } from "../../../src/infrastructure/model/orientBambuBuildPlate.js";

function bbox(positions: Float32Array) {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    minX = Math.min(minX, positions[i]!);
    minY = Math.min(minY, positions[i + 1]!);
    minZ = Math.min(minZ, positions[i + 2]!);
    maxX = Math.max(maxX, positions[i]!);
    maxY = Math.max(maxY, positions[i + 1]!);
    maxZ = Math.max(maxZ, positions[i + 2]!);
  }
  return { minX, minY, minZ, maxX, maxY, maxZ };
}

/** Axis-aligned box on Z=0 (Bambu build plate, meters). */
function zUpBox(dx: number, dy: number, dz: number): Float32Array {
  return new Float32Array([
    0, 0, 0, dx, 0, 0, 0, dy, dz, dx, 0, 0, dx, dy, dz, 0, dy, dz,
  ]);
}

/** docs/features/3d-viewer.md — Bambu 3MF: Z-up bed → Y-up web, no extra rotation. */
describe("orientBambuBuildPlateForPreview", () => {
  it("maps build-plate Z height to +Y without changing X/Z footprint ratio", () => {
    const source = zUpBox(0.102, 0.134, 0.011);
    const oriented = orientBambuBuildPlateForPreview(source);
    const size = bbox(oriented);
    expect(size.minY).toBeCloseTo(0, 5);
    expect(size.maxY - size.minY).toBeCloseTo(0.011, 4);
    expect(size.maxX - size.minX).toBeCloseTo(0.102, 4);
    expect(size.maxZ - size.minZ).toBeCloseTo(0.134, 4);
  });

  it("stands a Z-up figurine with former Z as height", () => {
    const source = zUpBox(0.05, 0.05, 0.12);
    const oriented = orientBambuBuildPlateForPreview(source);
    const size = bbox(oriented);
    expect(size.minY).toBeCloseTo(0, 5);
    expect(size.maxY - size.minY).toBeCloseTo(0.12, 3);
  });
});
