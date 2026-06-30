import { describe, expect, it, vi } from "vitest";

import {
  isCatalogThumbnailWarm,
  markCatalogThumbnailWarm,
  warmCatalogThumbnail,
  warmCatalogThumbnails,
} from "@/lib/catalogThumbnailCache";

describe("catalogThumbnailCache — docs/features/catalog-realtime.md", () => {
  it("tracks warmed thumbnail URLs for the SPA session", () => {
    markCatalogThumbnailWarm("/models/thumbnails/a.webp");
    expect(isCatalogThumbnailWarm("/models/thumbnails/a.webp")).toBe(true);
    expect(isCatalogThumbnailWarm("/models/thumbnails/b.webp")).toBe(false);
  });

  it("preloads thumbnails into an in-memory Image pool", () => {
    vi.stubGlobal("window", {} as Window);
    const ImageMock = vi.fn(function ImageMock(this: HTMLImageElement) {
      this.decoding = "auto";
    });
    vi.stubGlobal("Image", ImageMock);

    warmCatalogThumbnail("/models/thumbnails/cache-a.webp");
    warmCatalogThumbnail("/models/thumbnails/cache-a.webp");
    warmCatalogThumbnails(
      ["/models/thumbnails/cache-a.webp", "/models/thumbnails/cache-b.webp"],
      2,
    );

    expect(ImageMock).toHaveBeenCalledTimes(2);
    expect(isCatalogThumbnailWarm("/models/thumbnails/cache-a.webp")).toBe(true);
    expect(isCatalogThumbnailWarm("/models/thumbnails/cache-b.webp")).toBe(true);
  });
});
