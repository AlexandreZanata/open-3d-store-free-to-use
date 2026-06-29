import { describe, expect, it } from "vitest";

import {
  orientMeshForPrintPreview,
  scorePrintOrientation,
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
function boxSoup(width: number, height: number, depth: number): Float32Array {
  return new Float32Array([
    0,
    0,
    0,
    width,
    0,
    0,
    0,
    height,
    depth,
    width,
    0,
    0,
    width,
    height,
    depth,
    0,
    height,
    depth,
  ]);
}

describe("orientMeshForPrintPreview", () => {
  it("prefers a taller Y extent over a wide flat pose on the bed", () => {
    const lying = boxSoup(0.08, 0.01, 0.07);
    const lyingScore = scorePrintOrientation(bbox(lying));

    const oriented = orientMeshForPrintPreview(lying);
    const upright = bbox(oriented);
    const uprightScore = scorePrintOrientation(upright);

    expect(upright.maxY - upright.minY).toBeGreaterThan(0.05);
    expect(uprightScore).toBeGreaterThan(lyingScore);
  });

  it("maps slicer Z-up exports to glTF Y-up when Z is the tallest axis", () => {
    const zUp = new Float32Array([
      0,
      0,
      0,
      0.05,
      0,
      0,
      0,
      0,
      0.12,
      0.05,
      0,
      0,
      0.05,
      0,
      0.12,
      0,
      0,
      0.12,
    ]);
    const oriented = orientMeshForPrintPreview(zUp);
    const size = bbox(oriented);
    expect(size.maxY - size.minY).toBeCloseTo(0.12, 2);
  });
});
