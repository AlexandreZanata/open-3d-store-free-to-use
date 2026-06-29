import { describe, expect, it } from "vitest";

import { getAssetsBaseUrl, resolveAssetUrl } from "@/lib/assets";

describe("assets", () => {
  it("resolves model paths as same-origin relative URLs when base is unset", () => {
    expect(getAssetsBaseUrl()).toBe("");
    expect(resolveAssetUrl("/models/thumbnails/photo-frame.webp")).toBe(
      "/models/thumbnails/photo-frame.webp",
    );
  });

  it("passes through absolute URLs unchanged", () => {
    expect(resolveAssetUrl("https://cdn.example.com/a.webp")).toBe(
      "https://cdn.example.com/a.webp",
    );
  });

  it("prefixes configured base without double slashes", () => {
    const previous = process.env.VITE_ASSETS_BASE_URL;
    process.env.VITE_ASSETS_BASE_URL = "https://shop.example.com/";
    try {
      expect(resolveAssetUrl("/models/thumbnails/x.webp")).toBe(
        "https://shop.example.com/models/thumbnails/x.webp",
      );
    } finally {
      if (previous === undefined) {
        delete process.env.VITE_ASSETS_BASE_URL;
      } else {
        process.env.VITE_ASSETS_BASE_URL = previous;
      }
    }
  });
});
