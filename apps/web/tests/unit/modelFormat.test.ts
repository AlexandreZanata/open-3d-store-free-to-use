import { describe, expect, it } from "vitest";

import { buildGallerySlides } from "@/lib/gallerySlides";
import { detectModelFormat, formatDimensionsMm } from "@/lib/modelFormat";

describe("detectModelFormat", () => {
  it("detects 3MF from URL extension (Three.js ThreeMFLoader)", () => {
    expect(detectModelFormat("/models/3d/part.3mf")).toBe("3mf");
    expect(detectModelFormat("https://cdn.example.com/foo.3mf?v=1")).toBe("3mf");
  });

  it("detects glTF binary and JSON extensions", () => {
    expect(detectModelFormat("/models/3d/part.glb")).toBe("glb");
    expect(detectModelFormat("/models/3d/part.gltf")).toBe("gltf");
  });

  it("returns unknown for unsupported extensions", () => {
    expect(detectModelFormat("/models/3d/part.stl")).toBe("unknown");
  });
});

describe("formatDimensionsMm", () => {
  it("keeps 3MF coordinates in millimeters", () => {
    expect(formatDimensionsMm(80, 120, 25, "3mf")).toBe("80 × 120 × 25 mm");
  });

  it("converts glTF meters to millimeters for display", () => {
    expect(formatDimensionsMm(0.08, 0.12, 0.025, "glb")).toBe("80 × 120 × 25 mm");
  });
});

describe("buildGallerySlides", () => {
  it("deduplicates thumbnail when it appears in imageUrls", () => {
    expect(
      buildGallerySlides("/models/thumbnails/a.webp", [
        "/models/thumbnails/a.webp",
        "/models/images/b.webp",
      ]),
    ).toEqual(["/models/thumbnails/a.webp", "/models/images/b.webp"]);
  });

  it("places thumbnail first then gallery images", () => {
    expect(buildGallerySlides("/thumb.webp", ["/img-1.webp", "/img-2.webp"])).toEqual([
      "/thumb.webp",
      "/img-1.webp",
      "/img-2.webp",
    ]);
  });
});
