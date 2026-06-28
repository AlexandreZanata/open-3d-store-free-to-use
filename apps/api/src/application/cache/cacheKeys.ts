import { createHash } from "node:crypto";

import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { ProductFilters } from "../../domain/repositories/IProductRepository.js";

const PREFIX = "v1";

export const CACHE_TTL = {
  productDetail: 600,
  productList: 120,
  search: 60,
  categories: 300,
} as const;

export function productCacheKey(
  slug: string,
  locale: SupportedLocale,
): string {
  return `${PREFIX}:product:${slug}:${locale}`;
}

export function productListCacheKey(
  filters: ProductFilters,
  locale: SupportedLocale,
  page: number,
): string {
  const hash = createHash("sha256")
    .update(JSON.stringify({ filters, locale, page }))
    .digest("hex")
    .slice(0, 16);
  return `${PREFIX}:products:${hash}`;
}

export function categoriesCacheKey(locale: SupportedLocale): string {
  return `${PREFIX}:categories:${locale}`;
}

export function searchCacheKey(
  query: string,
  page: number,
  locale: SupportedLocale,
): string {
  const normalized = query.trim().toLowerCase();
  return `${PREFIX}:search:${normalized}:${page}:${locale}`;
}
