import { describe, expect, it } from "vitest";

import { documentFromPartMeshes } from "../../../src/infrastructure/model/documentFromPartMeshes.js";
import { preparePreviewAssembly } from "../../../src/infrastructure/model/preparePreviewAssembly.js";

describe("documentFromPartMeshes", () => {
  it("creates one glTF mesh per part with distinct materials", () => {
    const document = documentFromPartMeshes([
      {
        name: "Base",
        positions: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0]),
        defaultColorHex: "#000000",
      },
      {
        name: "Accent",
        positions: new Float32Array([0, 0, 5, 5, 0, 5, 0, 5, 5]),
        defaultColorHex: "#FFFFFF",
      },
    ]);
    expect(document).not.toBeNull();
    expect(document!.getRoot().listMeshes()).toHaveLength(2);
    const colors = document!.getRoot().listMaterials().map((material) => material.getBaseColorFactor());
    expect(colors[0]?.[0]).toBeCloseTo(0, 5);
    expect(colors[1]?.[0]).toBeCloseTo(1, 5);
  });
});

describe("preparePreviewAssembly", () => {
  it("orients the combined assembly onto the virtual build plate", () => {
    const input = [
      { name: "A", positions: new Float32Array([0, 0, 0, 100, 0, 0, 0, 100, 0]) },
      { name: "B", positions: new Float32Array([0, 0, 10, 50, 0, 10, 0, 50, 10]) },
    ];
    const parts = preparePreviewAssembly(input);
    expect(parts).toHaveLength(2);

    let minY = Infinity;
    for (const part of parts) {
      for (let i = 1; i < part.positions.length; i += 3) {
        minY = Math.min(minY, part.positions[i]!);
      }
    }
    expect(minY).toBeCloseTo(0, 3);
    expect(parts[0]!.positions[0]).not.toBe(input[0]!.positions[0]);
  });
});
