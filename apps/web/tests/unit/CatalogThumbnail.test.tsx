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

  it("renders visible immediately without opacity-0 flash gate", async () => {
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
    expect(img.className).not.toContain("opacity-0");
    expect(img.className).not.toContain("opacity-100");
  });

  it("marks thumbnail warm after onLoad", async () => {
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
    await act(async () => {
      img.dispatchEvent(new Event("load"));
    });

    expect(warmSpy).toHaveBeenCalledWith("/models/thumbnails/load.webp");
  });
});
