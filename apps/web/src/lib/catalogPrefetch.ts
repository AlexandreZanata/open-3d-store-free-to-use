import type { QueryClient } from "@tanstack/react-query";
import type { SupportedLocale } from "@print3d/shared-types";

import { categoriesQueryKey } from "@/hooks/useCategories";
import { favoritesQueryKey } from "@/hooks/useFavorites";
import { productsQueryKey } from "@/hooks/useProducts";
import { fetchCategories } from "@/lib/api/categories";
import { fetchFavorites } from "@/lib/api/favorites";
import { fetchProducts } from "@/lib/api/products";
import { readCachedFavoriteIds } from "@/lib/favoriteCache";
import { MOBILE_VIEWPORT_MQ } from "@/lib/layout";
import { shouldSyncFavorites } from "@/lib/favoritesSync";

/** Default list params — MUST match route loaders and `useProducts` on each tab. */
export const SEARCH_TAB_PARAMS = { page: 1, limit: 24 } as const;
export const CATEGORIES_TAB_PARAMS = { page: 1, limit: 50 } as const;
export const HOME_FEATURED_PARAMS = { featured: true as const, limit: 6, page: 1 } as const;
export const HOME_CATALOG_PARAMS = { page: 1, limit: 12 } as const;

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(MOBILE_VIEWPORT_MQ).matches;
}

export function scheduleIdleTask(task: () => void): void {
  if (typeof window === "undefined") {
    return;
  }
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => task(), { timeout: 2_000 });
    return;
  }
  globalThis.setTimeout(task, 200);
}

export async function ensureSearchTabCatalog(
  queryClient: QueryClient,
  locale: SupportedLocale,
): Promise<void> {
  await queryClient.ensureQueryData(searchTabQuery(locale));
}

export function prefetchSearchTabCatalog(
  queryClient: QueryClient,
  locale: SupportedLocale,
): Promise<void> {
  return queryClient.prefetchQuery(searchTabQuery(locale));
}

export async function ensureCategoriesTabCatalog(
  queryClient: QueryClient,
  locale: SupportedLocale,
): Promise<void> {
  await Promise.all([
    queryClient.ensureQueryData(categoriesTabCategoriesQuery(locale)),
    queryClient.ensureQueryData(categoriesTabProductsQuery(locale)),
  ]);
}

export function prefetchCategoriesTabCatalog(
  queryClient: QueryClient,
  locale: SupportedLocale,
): Promise<void> {
  return Promise.all([
    queryClient.prefetchQuery(categoriesTabCategoriesQuery(locale)),
    queryClient.prefetchQuery(categoriesTabProductsQuery(locale)),
  ]).then(() => undefined);
}

export function prefetchHomeTabCatalog(
  queryClient: QueryClient,
  locale: SupportedLocale,
): Promise<void> {
  return Promise.all([
    queryClient.prefetchQuery(homeFeaturedQuery(locale)),
    queryClient.prefetchQuery(homeCatalogQuery(locale)),
    queryClient.prefetchQuery(categoriesTabCategoriesQuery(locale)),
  ]).then(() => undefined);
}

export function prefetchFavoritesTab(
  queryClient: QueryClient,
  isAuthenticated: boolean,
): Promise<void> | undefined {
  const cachedCount = readCachedFavoriteIds().length;
  if (!shouldSyncFavorites(isAuthenticated, cachedCount)) {
    return undefined;
  }
  return queryClient.prefetchQuery({
    queryKey: favoritesQueryKey,
    queryFn: fetchFavorites,
  });
}

/** Idle warmup for mobile bottom-nav targets — contract: docs/features/catalog-performance.md */
export function scheduleMobileCatalogPrefetch(
  queryClient: QueryClient,
  locale: SupportedLocale,
): void {
  if (!isMobileViewport()) {
    return;
  }
  scheduleIdleTask(() => {
    void prefetchSearchTabCatalog(queryClient, locale);
    void prefetchCategoriesTabCatalog(queryClient, locale);
  });
}

export function prefetchMobileTabRoute(
  queryClient: QueryClient,
  locale: SupportedLocale,
  to: string,
  isAuthenticated: boolean,
): void {
  if (!isMobileViewport()) {
    return;
  }
  if (to === "/search") {
    void prefetchSearchTabCatalog(queryClient, locale);
    return;
  }
  if (to === "/categories") {
    void prefetchCategoriesTabCatalog(queryClient, locale);
    return;
  }
  if (to === "/") {
    void prefetchHomeTabCatalog(queryClient, locale);
    return;
  }
  if (to === "/favorites") {
    void prefetchFavoritesTab(queryClient, isAuthenticated);
  }
}

function searchTabQuery(locale: SupportedLocale) {
  return {
    queryKey: productsQueryKey(SEARCH_TAB_PARAMS, locale),
    queryFn: () => fetchProducts(SEARCH_TAB_PARAMS, locale),
  };
}

function categoriesTabCategoriesQuery(locale: SupportedLocale) {
  return {
    queryKey: categoriesQueryKey(locale),
    queryFn: () => fetchCategories(locale),
  };
}

function categoriesTabProductsQuery(locale: SupportedLocale) {
  return {
    queryKey: productsQueryKey(CATEGORIES_TAB_PARAMS, locale),
    queryFn: () => fetchProducts(CATEGORIES_TAB_PARAMS, locale),
  };
}

function homeFeaturedQuery(locale: SupportedLocale) {
  return {
    queryKey: productsQueryKey(HOME_FEATURED_PARAMS, locale),
    queryFn: () => fetchProducts(HOME_FEATURED_PARAMS, locale),
  };
}

function homeCatalogQuery(locale: SupportedLocale) {
  return {
    queryKey: productsQueryKey(HOME_CATALOG_PARAMS, locale),
    queryFn: () => fetchProducts(HOME_CATALOG_PARAMS, locale),
  };
}
