import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { SupportedLocale } from "@print3d/shared-types";

import { fetchCategories } from "@/lib/api/categories";
import { catalogQueryDefaults } from "@/lib/catalogQuery";
import { getActiveLocale } from "@/lib/locale";
import { resolveQueryLocale } from "@/hooks/useProducts";

export function categoriesQueryKey(locale: SupportedLocale = getActiveLocale()) {
  return ["categories", locale] as const;
}

export function useCategories() {
  const { i18n } = useTranslation();
  const locale = resolveQueryLocale(i18n.language);

  return useQuery({
    queryKey: categoriesQueryKey(locale),
    queryFn: () => fetchCategories(locale),
    placeholderData: keepPreviousData,
    ...catalogQueryDefaults,
  });
}
