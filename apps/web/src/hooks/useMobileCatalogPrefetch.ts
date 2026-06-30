import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { resolveQueryLocale } from "@/hooks/useProducts";
import { scheduleMobileCatalogPrefetch } from "@/lib/catalogPrefetch";

/** Idle mobile warmup for bottom-nav catalog routes — see docs/features/catalog-performance.md */
export function useMobileCatalogPrefetch(): void {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();

  useEffect(() => {
    scheduleMobileCatalogPrefetch(queryClient, resolveQueryLocale(i18n.language));
  }, [queryClient, i18n.language]);
}
