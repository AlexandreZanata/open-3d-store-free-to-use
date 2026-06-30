// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CatalogThumbnail } from "@/components/CatalogThumbnail";
import * as catalogThumbnailCache from "@/lib/catalogThumbnailCache";

describe("CatalogThumbnail — docs/features/catalog-realtime.md", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it("starts hidden until the image decodes on cold load", async () => {
    await act(async () => {
      root.render(
        <CatalogThumbnail
          src="/models/thumbnails/cold.webp"
          alt="Product"
          width={800}
          height={800}
        />,
      );
    });

    const img = container.querySelector('[data-testid="catalog-thumbnail"]') as HTMLImageElement;
    expect(img.className).toContain("opacity-0");
    expect(img.className).not.toContain("opacity-100");
  });

  it("shows immediately when img.complete is true before paint on remount", async () => {
    const warmSpy = vi.spyOn(catalogThumbnailCache, "markCatalogThumbnailWarm");
    const completeSpy = vi
      .spyOn(HTMLImageElement.prototype, "complete", "get")
      .mockReturnValue(true);
    const widthSpy = vi
      .spyOn(HTMLImageElement.prototype, "naturalWidth", "get")
      .mockReturnValue(400);

    await act(async () => {
      root.render(
        <CatalogThumbnail
          src="/models/thumbnails/cached.webp"
          alt="Product"
          width={800}
          height={800}
        />,
      );
    });

    const img = container.querySelector('[data-testid="catalog-thumbnail"]') as HTMLImageElement;
    expect(img.className).toContain("opacity-100");
    expect(warmSpy).toHaveBeenCalledWith("/models/thumbnails/cached.webp");

    completeSpy.mockRestore();
    widthSpy.mockRestore();
  });

  it("becomes visible after onLoad fires", async () => {
    const warmSpy = vi.spyOn(catalogThumbnailCache, "markCatalogThumbnailWarm");

    await act(async () => {
      root.render(
        <CatalogThumbnail
          src="/models/thumbnails/load.webp"
          alt="Product"
          width={800}
          height={800}
        />,
      );
    });

    const img = container.querySelector('[data-testid="catalog-thumbnail"]') as HTMLImageElement;
    expect(img.className).toContain("opacity-0");

    await act(async () => {
      Object.defineProperty(img, "naturalWidth", { value: 200, configurable: true });
      img.dispatchEvent(new Event("load"));
    });

    expect(img.className).toContain("opacity-100");
    expect(warmSpy).toHaveBeenCalledWith("/models/thumbnails/load.webp");
  });
});
