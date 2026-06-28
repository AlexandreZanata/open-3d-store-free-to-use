import { describe, expect, it, vi } from "vitest";

import { ListProducts } from "../../../src/application/use-cases/ListProducts.js";
import { CACHE_TTL, productListCacheKey } from "../../../src/application/cache/cacheKeys.js";
import {
  createMockCache,
  createMockProductRepository,
  sampleProduct,
} from "./testHelpers.js";

describe("ListProducts", () => {
  it("maps list items with basePriceDisplay per GET /products contract", async () => {
    const products = createMockProductRepository({
      findMany: vi.fn(async () => ({
        data: [sampleProduct],
        pagination: { total: 1, page: 1, totalPages: 1, limit: 20 },
      })),
    });
    const useCase = new ListProducts(products, createMockCache());

    const result = await useCase.execute({}, { page: 1, limit: 20 }, "en");

    expect(result.data[0]?.basePriceDisplay).toBe("R$ 45,00");
    expect(result.data[0]?.hasModel).toBe(true);
    expect(result.data[0]?.locale).toBe("en");
  });

  it("caches list results for 120s per performance-caching.md", async () => {
    const products = createMockProductRepository({
      findMany: vi.fn(async () => ({
        data: [],
        pagination: { total: 0, page: 1, totalPages: 0, limit: 20 },
      })),
    });
    const cache = createMockCache();
    const useCase = new ListProducts(products, cache);
    const filters = { category: "gifts" };

    await useCase.execute(filters, { page: 1, limit: 20 }, "en");

    expect(cache.set).toHaveBeenCalledWith(
      productListCacheKey(filters, "en", 1),
      expect.any(Object),
      CACHE_TTL.productList,
    );
  });
});
