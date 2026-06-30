import type { PaginatedProducts, ProductDetail, SupportedLocale } from "@print3d/shared-types";

import { apiFetch } from "./client";
import type { ProductQueryParams } from "./types";

function toSearchParams(params: ProductQueryParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.category) search.set("category", params.category);
  if (params.material) search.set("material", params.material);
  if (params.status) search.set("status", params.status);
  if (params.featured === true) search.set("featured", "true");
  if (params.q) search.set("q", params.q);
  if (params.minPrice != null) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) search.set("maxPrice", String(params.maxPrice));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchProducts(
  params: ProductQueryParams = {},
  locale?: SupportedLocale,
): Promise<PaginatedProducts> {
  return apiFetch<PaginatedProducts>(`/products${toSearchParams(params)}`, { locale });
}

export async function fetchProductBySlug(
  slug: string,
  locale?: SupportedLocale,
): Promise<ProductDetail> {
  const response = await apiFetch<{ data: ProductDetail }>(`/products/${slug}`, { locale });
  return response.data;
}

export async function searchProducts(
  q: string,
  params: Omit<ProductQueryParams, "q"> = {},
  locale?: SupportedLocale,
): Promise<PaginatedProducts> {
  return fetchProducts({ ...params, q }, locale);
}
