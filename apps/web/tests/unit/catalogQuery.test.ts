import { describe, expect, it, vi } from "vitest";

import {
  CATALOG_QUERY_GC_MS,
  CATALOG_QUERY_STALE_MS,
  isCatalogQueryPending,
  warmHomeCatalogImages,
} from "@/lib/catalogQuery";

describe("catalogQuery — docs/features/catalog-realtime.md", () => {
  it("keeps catalog data fresh for navigation but allows SSE invalidation", () => {
    expect(CATALOG_QUERY_STALE_MS).toBeGreaterThanOrEqual(60_000);
    expect(CATALOG_QUERY_GC_MS).toBeGreaterThan(CATALOG_QUERY_STALE_MS);
  });

  it("shows skeleton only when no cached catalog data exists", () => {
    expect(isCatalogQueryPending({ isPending: true, data: undefined })).toBe(true);
    expect(isCatalogQueryPending({ isPending: false, data: [] })).toBe(false);
    expect(isCatalogQueryPending({ isPending: true, data: { data: [] } })).toBe(false);
  });

  it("warms browser image cache for home catalog thumbnails", () => {
    vi.stubGlobal("window", {} as Window);
    const ImageMock = vi.fn(function ImageMock(this: HTMLImageElement) {
      this.decoding = "auto";
    });
    vi.stubGlobal("Image", ImageMock);

    warmHomeCatalogImages(
      {
        getQueryData: (key: readonly unknown[]) => {
          if (key[0] === "products") {
            return { data: [{ thumbnailUrl: "/models/thumbnails/a.webp" }] };
          }
          if (key[0] === "categories") {
            return [{ imageUrl: "/models/thumbnails/cat.webp" }];
          }
          return undefined;
        },
      } as never,
      "pt-BR",
    );

    expect(ImageMock).toHaveBeenCalledTimes(2);
    const img = ImageMock.mock.instances[0] as HTMLImageElement;
    expect(img.src).toContain("/models/thumbnails/a.webp");
  });
});
