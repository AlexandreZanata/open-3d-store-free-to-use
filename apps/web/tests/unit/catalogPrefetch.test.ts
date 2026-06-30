import { describe, expect, it } from "vitest";

import { categoriesQueryKey } from "@/hooks/useCategories";
import { productsQueryKey } from "@/hooks/useProducts";
import {
  CATEGORIES_TAB_PARAMS,
  HOME_CATALOG_PARAMS,
  HOME_FEATURED_PARAMS,
  SEARCH_TAB_PARAMS,
} from "@/lib/catalogPrefetch";

/** Expected keys from docs/features/catalog-performance.md */
describe("catalogPrefetch — docs/features/catalog-performance.md", () => {
  const locale = "pt-BR" as const;

  it("uses the same product query keys as useProducts on each tab", () => {
    expect(productsQueryKey(SEARCH_TAB_PARAMS, locale)).toEqual([
      "products",
      locale,
      SEARCH_TAB_PARAMS,
    ]);
    expect(productsQueryKey(CATEGORIES_TAB_PARAMS, locale)).toEqual([
      "products",
      locale,
      CATEGORIES_TAB_PARAMS,
    ]);
    expect(productsQueryKey(HOME_CATALOG_PARAMS, locale)).toEqual([
      "products",
      locale,
      HOME_CATALOG_PARAMS,
    ]);
    expect(productsQueryKey(HOME_FEATURED_PARAMS, locale)).toEqual([
      "products",
      locale,
      HOME_FEATURED_PARAMS,
    ]);
  });

  it("uses the same categories query key as useCategories", () => {
    expect(categoriesQueryKey(locale)).toEqual(["categories", locale]);
  });
});
