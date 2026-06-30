import { describe, expect, it, vi } from "vitest";

import { GetProductBySlug } from "../../../src/application/use-cases/GetProductBySlug.js";
import { toProductDetailDto } from "../../../src/application/dtos/ProductResponseDto.js";
import { CACHE_TTL, productCacheKey } from "../../../src/application/cache/cacheKeys.js";
import {
  createMockCache,
  createMockProductRepository,
  sampleProduct,
  sampleProductPt,
} from "./testHelpers.js";

describe("GetProductBySlug", () => {
  it("returns locale-resolved product detail per API contract", async () => {
    const products = createMockProductRepository({
      findBySlug: vi.fn(async (slug, locale) => {
        if (slug !== "custom-photo-frame") {
          return null;
        }
        return locale === "pt-BR" ? sampleProductPt : sampleProduct;
      }),
    });
    const cache = createMockCache();
    const useCase = new GetProductBySlug(products, cache, "/tmp/test-models");

    const en = await useCase.execute("custom-photo-frame", "en");
    const pt = await useCase.execute("custom-photo-frame", "pt-BR");

    expect(en?.name).toBe("Custom Photo Frame");
    expect(en?.basePriceDisplay).toBe("R$ 45,00");
    expect(en?.locale).toBe("en");
    expect(pt?.name).toBe("Porta-retrato personalizado");
    expect(pt?.locale).toBe("pt-BR");
  });

  it("caches product detail for 600s per performance-caching.md", async () => {
    const products = createMockProductRepository({
      findBySlug: vi.fn(async () => sampleProduct),
    });
    const cache = createMockCache();
    const useCase = new GetProductBySlug(products, cache, "/tmp/test-models");

    await useCase.execute("custom-photo-frame", "en");
    await useCase.execute("custom-photo-frame", "en");

    expect(products.findBySlug).toHaveBeenCalledTimes(1);
    expect(cache.set).toHaveBeenCalledWith(
      productCacheKey("custom-photo-frame", "en"),
      expect.objectContaining({ slug: "custom-photo-frame" }),
      CACHE_TTL.productDetail,
    );
  });

  it("re-resolves cached modelFileUrl using modelsBasePath", async () => {
    const modelsBase = "/tmp/print3d-gps-models";
    const { mkdir, writeFile, rm } = await import("node:fs/promises");
    await mkdir(`${modelsBase}/3d`, { recursive: true });
    await writeFile(`${modelsBase}/3d/custom-photo-frame-preview.glb`, "glb");

    const cached = toProductDetailDto(sampleProduct, "en");
    cached.modelFileUrl = "/models/3d/custom-photo-frame.stl";
    const cache = createMockCache({
      [productCacheKey("custom-photo-frame", "en")]: cached,
    });
    const products = createMockProductRepository();
    const useCase = new GetProductBySlug(products, cache, modelsBase);

    const result = await useCase.execute("custom-photo-frame", "en");

    expect(products.findBySlug).not.toHaveBeenCalled();
    expect(result?.modelFileUrl).toBe("/models/3d/custom-photo-frame-preview.glb");

    await rm(modelsBase, { recursive: true, force: true });
  });

  it("returns null when product slug does not exist", async () => {
    const products = createMockProductRepository({
      findBySlug: vi.fn(async () => null),
    });
    const useCase = new GetProductBySlug(products, createMockCache(), "/tmp/test-models");

    expect(await useCase.execute("missing", "en")).toBeNull();
  });
});
