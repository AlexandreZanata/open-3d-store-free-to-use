import { describe, expect, it, vi } from "vitest";

import { SearchProducts } from "../../../src/application/use-cases/SearchProducts.js";
import { CACHE_TTL, searchCacheKey } from "../../../src/application/cache/cacheKeys.js";
import {
  createMockCache,
  createMockProductRepository,
  sampleProduct,
} from "./testHelpers.js";

describe("SearchProducts", () => {
  it("returns search results with locale field", async () => {
    const products = createMockProductRepository({
      search: vi.fn(async () => ({
        data: [sampleProduct],
        pagination: { total: 1, page: 1, totalPages: 1, limit: 20 },
      })),
    });
    const useCase = new SearchProducts(products, createMockCache());

    const result = await useCase.execute("photo frame", { page: 1, limit: 20 }, "en");

    expect(result.data[0]?.name).toBe("Custom Photo Frame");
    expect(result.data[0]?.locale).toBe("en");
  });

  it("caches search results for 60s per performance-caching.md", async () => {
    const products = createMockProductRepository({
      search: vi.fn(async () => ({
        data: [],
        pagination: { total: 0, page: 1, totalPages: 0, limit: 20 },
      })),
    });
    const cache = createMockCache();
    const useCase = new SearchProducts(products, cache);

    await useCase.execute("photo", { page: 1, limit: 20 }, "en");

    expect(cache.set).toHaveBeenCalledWith(
      searchCacheKey("photo", 1, "en"),
      expect.any(Object),
      CACHE_TTL.search,
    );
  });
});
