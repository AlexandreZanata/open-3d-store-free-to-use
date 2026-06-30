import type { QueryClient, UseQueryResult } from "@tanstack/react-query";
import type { CategoryResponse, PaginatedProducts, SupportedLocale } from "@print3d/shared-types";

import { categoriesQueryKey } from "@/hooks/useCategories";
import { productsQueryKey } from "@/hooks/useProducts";
import { resolveAssetUrl } from "@/lib/assets";
import { warmCatalogThumbnails } from "@/lib/catalogThumbnailCache";

/** Navigation cache — SSE invalidation still marks queries stale and refetches active views. */
export const CATALOG_QUERY_STALE_MS = 5 * 60 * 1000;
export const CATALOG_QUERY_GC_MS = 30 * 60 * 1000;

export const catalogQueryDefaults = {
  staleTime: CATALOG_QUERY_STALE_MS,
  gcTime: CATALOG_QUERY_GC_MS,
} as const;

/** Skeleton only when there is no cached catalog data yet (not on background refetch). */
export function isCatalogQueryPending<T>(
  query: Pick<UseQueryResult<T, Error>, "data" | "isPending">,
): boolean {
  return query.isPending && query.data === undefined;
}

export function warmHomeCatalogImages(queryClient: QueryClient, locale: SupportedLocale): void {
  if (typeof window === "undefined") {
    return;
  }

  const products = queryClient.getQueryData<PaginatedProducts>(
    productsQueryKey({ page: 1, limit: 12 }, locale),
  );
  const featured = queryClient.getQueryData<PaginatedProducts>(
    productsQueryKey({ page: 1, limit: 6, featured: true }, locale),
  );
  const categories = queryClient.getQueryData<CategoryResponse[]>(categoriesQueryKey(locale));

  const urls: string[] = [];
  for (const product of featured?.data ?? []) {
    urls.push(resolveAssetUrl(product.thumbnailUrl));
  }
  for (const product of products?.data ?? []) {
    urls.push(resolveAssetUrl(product.thumbnailUrl));
  }
  for (const category of categories ?? []) {
    urls.push(resolveAssetUrl(category.imageUrl));
  }
  warmCatalogThumbnails(urls);
}
