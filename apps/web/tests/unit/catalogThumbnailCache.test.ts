import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  CATALOG_THUMBNAIL_WARM_LIMIT,
  isCatalogThumbnailWarm,
  markCatalogThumbnailWarm,
  warmCatalogThumbnail,
  warmCatalogThumbnails,
} from "@/lib/catalogThumbnailCache";

describe("catalogThumbnailCache — docs/features/catalog-realtime.md", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {} as Window);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("tracks manually marked decoded thumbnail URLs for the SPA session", () => {
    markCatalogThumbnailWarm("/models/thumbnails/a.webp");
    expect(isCatalogThumbnailWarm("/models/thumbnails/a.webp")).toBe(true);
    expect(isCatalogThumbnailWarm("/models/thumbnails/b.webp")).toBe(false);
  });

  it("does not mark URL warm until pool Image onload with naturalWidth > 0", () => {
    const instances: HTMLImageElement[] = [];
    const ImageMock = vi.fn(function ImageMock(this: HTMLImageElement) {
      instances.push(this);
      this.decoding = "auto";
    });
    vi.stubGlobal("Image", ImageMock);

    warmCatalogThumbnail("/models/thumbnails/pending.webp");
    expect(isCatalogThumbnailWarm("/models/thumbnails/pending.webp")).toBe(false);

    const img = instances[0]!;
    Object.defineProperty(img, "naturalWidth", { value: 800, configurable: true });
    Object.defineProperty(img, "complete", { value: true, configurable: true });
    img.onload?.(new Event("load"));

    expect(isCatalogThumbnailWarm("/models/thumbnails/pending.webp")).toBe(true);
  });

  it("does not mark URL warm when pool Image onerror fires", () => {
    const instances: HTMLImageElement[] = [];
    const ImageMock = vi.fn(function ImageMock(this: HTMLImageElement) {
      instances.push(this);
    });
    vi.stubGlobal("Image", ImageMock);

    warmCatalogThumbnail("/models/thumbnails/broken.webp");
    instances[0]!.onerror?.(new Event("error"));

    expect(isCatalogThumbnailWarm("/models/thumbnails/broken.webp")).toBe(false);
  });

  it("preloads thumbnails into an in-memory Image pool up to the warm limit", () => {
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
    expect(CATALOG_THUMBNAIL_WARM_LIMIT).toBeGreaterThanOrEqual(32);
  });
});
