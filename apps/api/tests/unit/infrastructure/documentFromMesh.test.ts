import { describe, expect, it } from "vitest";

import {
  documentFromMesh,
  millimetersToMeters,
  positionsToMeters,
} from "../../../src/infrastructure/model/documentFromMesh.js";

describe("documentFromMesh", () => {
  it("creates indexed TRIANGLES primitive with PBR material", () => {
    const positions = new Float32Array([
      0, 0, 0, 0.1, 0, 0, 0, 0.1, 0, 0, 0, 0, 0.1, 0, 0, 0, 0.1, 0,
    ]);
    const document = documentFromMesh(positions, "Test");
    expect(document).not.toBeNull();

    const primitive = document!.getRoot().listMeshes()[0]!.listPrimitives()[0]!;
    expect(primitive.getMode()).toBe(4);
    expect(primitive.getIndices()?.getCount()).toBe(6);
    expect(primitive.getAttribute("POSITION")?.getCount()).toBe(6);
    expect(primitive.getMaterial()).not.toBeNull();
    expect(primitive.getMaterial()?.getDoubleSided()).toBe(true);
  });
});

describe("positionsToMeters", () => {
  it("keeps meter-scale STL coordinates unchanged", () => {
    const positions = new Float32Array([0, 0, 0, 0.8, 0.12, 0.92]);
    const meters = positionsToMeters(positions);
    expect(meters).toBe(positions);
    expect(meters[3]).toBeCloseTo(0.8);
  });

  it("converts millimeter-scale STL coordinates to meters", () => {
    const positions = new Float32Array([0, 0, 0, 800, 120, 920]);
    const meters = positionsToMeters(positions);
    const expected = millimetersToMeters(positions);
    expect(Array.from(meters)).toEqual(Array.from(expected));
  });
});
