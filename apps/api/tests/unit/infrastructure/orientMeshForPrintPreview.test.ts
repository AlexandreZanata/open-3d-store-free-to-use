import { describe, expect, it } from "vitest";

import { symmetricEigen3x3 } from "../../../src/infrastructure/model/meshPrincipalAxes.js";
import {
  orientHeroLogoMesh,
  orientMeshForPrintPreview,
  orientSlicerExportForPreview,
} from "../../../src/infrastructure/model/orientMeshForPrintPreview.js";

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

/** Two triangles spanning an axis-aligned box (meters). */
function thinBoxSoup(width: number, height: number, depth: number): Float32Array {
  return new Float32Array([
    0, 0, 0, width, 0, 0, 0, height, depth, width, 0, 0, width, height, depth, 0, height, depth,
  ]);
}

describe("orientMeshForPrintPreview", () => {
  it("lays a thin Bambu Z-up bed plate flat face-up for storefront preview", () => {
    const flatOnPlate = thinBoxSoup(0.102, 0.134, 0.011);
    const oriented = orientMeshForPrintPreview(flatOnPlate);
    const size = bbox(oriented);
    expect(size.minY).toBeCloseTo(0, 5);
    expect(size.maxY - size.minY).toBeLessThan(0.02);
    expect(size.maxX - size.minX).toBeGreaterThan(0.08);
    expect(size.maxZ - size.minZ).toBeGreaterThan(0.08);
  });

  it("centers mesh on the virtual build plate", () => {
    const zUp = thinBoxSoup(0.05, 0.05, 0.12);
    const oriented = orientMeshForPrintPreview(zUp);
    const size = bbox(oriented);
    expect(size.minY).toBeCloseTo(0, 5);
  });

  it("stands a Z-up box when height is on Z", () => {
    const zUp = thinBoxSoup(0.05, 0.05, 0.12);
    const oriented = orientSlicerExportForPreview(zUp);
    const size = bbox(oriented);
    expect(size.minY).toBeCloseTo(0, 5);
    expect(size.maxY - size.minY).toBeCloseTo(0.12, 2);
    expect(size.maxX - size.minX).toBeLessThanOrEqual(0.05 + 0.001);
  });

  it("stands a Z-up figurine when Y and Z spans are similar (3MF build plate)", () => {
    const zUpFigurine = thinBoxSoup(0.014, 0.025, 0.024);
    const oriented = orientSlicerExportForPreview(zUpFigurine);
    const size = bbox(oriented);
    expect(size.minY).toBeCloseTo(0, 5);
    expect(size.maxY - size.minY).toBeCloseTo(0.024, 3);
    expect(size.maxY - size.minY).toBeGreaterThan(size.maxX - size.minX);
  });

  it("stands a flat logo (thin Y) on edge with Z as height", () => {
    const flatLogo = thinBoxSoup(0.898, 0.116, 0.8);
    const oriented = orientHeroLogoMesh(flatLogo);
    const size = bbox(oriented);
    expect(size.minY).toBeCloseTo(0, 5);
    expect(size.maxY - size.minY).toBeCloseTo(0.8, 2);
    expect(size.maxZ - size.minZ).toBeLessThan(0.2);
  });
});

describe("symmetricEigen3x3", () => {
  it("orders eigenvalues ascending for a diagonal matrix", () => {
    const result = symmetricEigen3x3([4, 9, 16, 0, 0, 0]);
    expect(result.values[0]).toBeCloseTo(4, 4);
    expect(result.values[1]).toBeCloseTo(9, 4);
    expect(result.values[2]).toBeCloseTo(16, 4);
  });
});
