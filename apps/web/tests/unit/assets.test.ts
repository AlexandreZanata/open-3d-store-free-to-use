import { describe, expect, it } from "vitest";

import { getAssetsBaseUrl, resolveAssetUrl } from "@/lib/assets";

describe("assets — docs/infrastructure/environment.md", () => {
  it("resolves model paths as same-origin relative URLs when base is unset", () => {
    expect(getAssetsBaseUrl()).toBe("");
    expect(resolveAssetUrl("/models/thumbnails/dragon.webp")).toBe(
      "/models/thumbnails/dragon.webp",
    );
  });

  it("passes through absolute URLs unchanged", () => {
    expect(resolveAssetUrl("https://cdn.example.com/a.webp")).toBe(
      "https://cdn.example.com/a.webp",
    );
  });
});
