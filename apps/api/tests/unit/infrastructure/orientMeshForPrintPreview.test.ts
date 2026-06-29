import { describe, expect, it } from "vitest";

import { symmetricEigen3x3 } from "../../../src/infrastructure/model/meshPrincipalAxes.js";
import {
  orientMeshForPrintPreview,
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
  it("stands a thin box on its tallest principal axis", () => {
    const lying = thinBoxSoup(0.08, 0.01, 0.07);
    const oriented = orientMeshForPrintPreview(lying);
    const size = bbox(oriented);
    expect(size.minY).toBeCloseTo(0, 5);
    expect(size.maxY - size.minY).toBeGreaterThan(0.05);
    expect(size.maxY - size.minY).toBeGreaterThanOrEqual(0.07);
  });

  it("centers mesh on the virtual build plate", () => {
    const zUp = thinBoxSoup(0.05, 0.12, 0.05);
    const oriented = orientMeshForPrintPreview(zUp);
    const size = bbox(oriented);
    expect(size.minY).toBeCloseTo(0, 5);
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
