import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { SupportedLocale } from "@print3d/shared-types";

import { fetchProducts, searchProducts } from "@/lib/api/products";
import type { ProductQueryParams } from "@/lib/api/types";
import { getActiveLocale } from "@/lib/locale";

export function resolveQueryLocale(language: string): SupportedLocale {
  return language === "en" || language === "pt-BR" ? language : getActiveLocale();
}

export function productsQueryKey(
  params: ProductQueryParams = {},
  locale: SupportedLocale = getActiveLocale(),
) {
  return ["products", locale, params] as const;
}

export function useProducts(params: ProductQueryParams = {}) {
  const { i18n } = useTranslation();
  const locale = resolveQueryLocale(i18n.language);

  return useQuery({
    queryKey: productsQueryKey(params, locale),
    queryFn: () => fetchProducts(params, locale),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });
}

export function useProductSearch(q: string, params: Omit<ProductQueryParams, "q"> = {}) {
  const { i18n } = useTranslation();
  const locale = resolveQueryLocale(i18n.language);

  return useQuery({
    queryKey: ["products", "search", locale, q, params] as const,
    queryFn: () => searchProducts(q, params, locale),
    enabled: q.trim().length > 0,
  });
}
