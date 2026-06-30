import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { SupportedLocale } from "@print3d/shared-types";

import { fetchProductBySlug } from "@/lib/api/products";
import { catalogQueryDefaults } from "@/lib/catalogQuery";
import { getActiveLocale } from "@/lib/locale";
import { resolveQueryLocale } from "@/hooks/useProducts";

export function productQueryKey(slug: string, locale: SupportedLocale = getActiveLocale()) {
  return ["product", locale, slug] as const;
}

export function useProduct(slug: string) {
  const { i18n } = useTranslation();
  const locale = resolveQueryLocale(i18n.language);

  return useQuery({
    queryKey: productQueryKey(slug, locale),
    queryFn: () => fetchProductBySlug(slug, locale),
    enabled: slug.length > 0,
    placeholderData: keepPreviousData,
    ...catalogQueryDefaults,
  });
}
