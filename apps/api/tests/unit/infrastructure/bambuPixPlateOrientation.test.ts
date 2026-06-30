import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

import { preparePreviewAssembly } from "../../../src/infrastructure/model/preparePreviewAssembly.js";
import { read3mfPartMeshes } from "../../../src/infrastructure/model/read3mfPartMeshes.js";

const PIX_FIXTURE = "/tmp/pix-model/pix.3mf";

function bboxMm(positions: Float32Array) {
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
  return {
    x: (maxX - minX) * 1000,
    y: (maxY - minY) * 1000,
    z: (maxZ - minZ) * 1000,
    minY,
  };
}

/** Bambu PIX plate: ~102×135×11 mm flat on virtual desk (docs/features/3d-viewer.md). */
describe.skipIf(!existsSync(PIX_FIXTURE))("bambuPixPlateOrientation", () => {
  it("orients multi-part PIX plate flat with thin height on Y", () => {
    const data = readFileSync(PIX_FIXTURE);
    const parts = read3mfPartMeshes(data);
    expect(parts).not.toBeNull();
    expect(parts!.length).toBeGreaterThanOrEqual(4);

    const oriented = preparePreviewAssembly(parts!);
    const combined = new Float32Array(
      oriented.reduce((sum, part) => sum + part.positions.length, 0),
    );
    let offset = 0;
    for (const part of oriented) {
      combined.set(part.positions, offset);
      offset += part.positions.length;
    }

    const size = bboxMm(combined);
    expect(size.minY).toBeCloseTo(0, 3);
    expect(size.y).toBeLessThan(20);
    expect(size.x).toBeGreaterThan(90);
    expect(size.z).toBeGreaterThan(120);
  });
});
