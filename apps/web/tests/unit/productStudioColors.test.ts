import { describe, expect, it } from "vitest";

import type { ModelPart } from "@print3d/shared-types";

import { buildGallerySlides } from "@/lib/gallerySlides";

function basePartColors(parts: ModelPart[], shopDefault: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const part of parts) {
    map[part.id] = part.defaultColorHex ?? shopDefault;
  }
  return map;
}

describe("product studio default part colors", () => {
  it("uses Bambu defaultColorHex per part when present", () => {
    const parts: ModelPart[] = [
      { id: "a", name: "Base", volumeCm3: 1, weightGrams: 1, defaultColorHex: "#000000" },
      { id: "b", name: "QR", volumeCm3: 1, weightGrams: 1, defaultColorHex: "#FFFFFF" },
    ];
    expect(basePartColors(parts, "#9CA3AF")).toEqual({
      a: "#000000",
      b: "#FFFFFF",
    });
  });

  it("falls back to shop palette for parts without slicer colour", () => {
    const parts: ModelPart[] = [{ id: "a", name: "Part 1", volumeCm3: null, weightGrams: null }];
    expect(basePartColors(parts, "#9CA3AF")).toEqual({ a: "#9CA3AF" });
  });
});

describe("buildGallerySlides", () => {
  it("deduplicates thumbnail from gallery list", () => {
    expect(buildGallerySlides("/t.webp", ["/t.webp", "/a.webp"]).length).toBe(2);
  });
});
