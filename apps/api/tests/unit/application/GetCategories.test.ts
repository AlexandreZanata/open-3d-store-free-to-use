import { describe, expect, it, vi } from "vitest";

import { GetCategories } from "../../../src/application/use-cases/GetCategories.js";
import { CACHE_TTL, categoriesCacheKey } from "../../../src/application/cache/cacheKeys.js";
import type { ICategoryRepository } from "../../../src/domain/repositories/ICategoryRepository.js";
import { createMockCache } from "./testHelpers.js";

describe("GetCategories", () => {
  it("returns active categories with locale per GET /categories contract", async () => {
    const categories: ICategoryRepository = {
      findAllActive: vi.fn(async (locale) => [
        {
          id: "01935abc-def0-7890-abcd-ef1234567890",
          slug: "miniatures",
          name: locale === "pt-BR" ? "Miniaturas" : "Miniatures",
          description: "Custom figurines",
          parentId: null,
          imageUrl: "/models/thumbnails/miniatures.webp",
          sortOrder: 1,
          isActive: true,
        },
      ]),
      findBySlug: vi.fn(),
    };
    const useCase = new GetCategories(categories, createMockCache());

    const en = await useCase.execute("en");
    const pt = await useCase.execute("pt-BR");

    expect(en[0]?.name).toBe("Miniatures");
    expect(en[0]?.locale).toBe("en");
    expect(pt[0]?.name).toBe("Miniaturas");
  });

  it("caches categories for 300s per performance-caching.md", async () => {
    const categories: ICategoryRepository = {
      findAllActive: vi.fn(async () => []),
      findBySlug: vi.fn(),
    };
    const cache = createMockCache();
    const useCase = new GetCategories(categories, cache);

    await useCase.execute("en");

    expect(cache.set).toHaveBeenCalledWith(
      categoriesCacheKey("en"),
      [],
      CACHE_TTL.categories,
    );
  });
});
