import { createHash } from "node:crypto";

import type { ProductFilters } from "../../domain/repositories/IProductRepository.js";

const PREFIX = "v1";

export function productKey(slug: string): string {
  return `${PREFIX}:product:${slug}`;
}

export function productListKey(filters: ProductFilters): string {
  const hash = createHash("sha256")
    .update(JSON.stringify(filters))
    .digest("hex")
    .slice(0, 16);
  return `${PREFIX}:products:${hash}`;
}

export function categoriesKey(): string {
  return `${PREFIX}:categories`;
}

export function searchKey(query: string, page: number): string {
  const normalized = query.trim().toLowerCase();
  return `${PREFIX}:search:${normalized}:${page}`;
}
