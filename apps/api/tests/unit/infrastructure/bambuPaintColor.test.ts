import { describe, expect, it } from "vitest";

import {
  decodeBambuPaintSlots,
  primaryBambuPaintSlot,
} from "../../../src/infrastructure/model/bambuPaintColor.js";

/** Values from docs/features/3d-viewer.md (Printago / Bambu Studio paint_color table). */
describe("bambuPaintColor", () => {
  it("decodes single-slot paint codes", () => {
    expect(decodeBambuPaintSlots("4")).toEqual([1]);
    expect(decodeBambuPaintSlots("8")).toEqual([2]);
    expect(decodeBambuPaintSlots("0C")).toEqual([3]);
    expect(decodeBambuPaintSlots("FC")).toEqual([16]);
  });

  it("matches longer slot codes before shorter prefixes", () => {
    expect(decodeBambuPaintSlots("8C")).toEqual([9]);
  });

  it("uses base extruder for unpainted triangles", () => {
    expect(primaryBambuPaintSlot("", 3)).toBe(3);
    expect(primaryBambuPaintSlot(undefined, 1)).toBe(1);
  });

  it("uses lowest painted slot as primary", () => {
    expect(primaryBambuPaintSlot("0C", 1)).toBe(3);
  });
});
