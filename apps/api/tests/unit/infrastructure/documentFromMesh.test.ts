import { describe, expect, it } from "vitest";

import {
  millimetersToMeters,
  positionsToMeters,
} from "../../../src/infrastructure/model/documentFromMesh.js";

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
