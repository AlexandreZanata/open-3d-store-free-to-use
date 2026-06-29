import type { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getApiBaseUrl } from "@/lib/api/client";

const CATALOG_SSE_EVENT = "catalog.changed";

export function invalidateCatalogQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ["products"], refetchType: "all" });
  void queryClient.invalidateQueries({ queryKey: ["categories"], refetchType: "all" });
  void queryClient.invalidateQueries({ queryKey: ["product"], refetchType: "all" });
}

export function useCatalogRealtime(queryClient: QueryClient): void {
  useEffect(() => {
    if (typeof window === "undefined" || typeof EventSource === "undefined") {
      return;
    }

    const source = new EventSource(`${getApiBaseUrl()}/catalog/events`);
    const onCatalogChanged = () => {
      invalidateCatalogQueries(queryClient);
    };

    source.addEventListener(CATALOG_SSE_EVENT, onCatalogChanged);
    return () => {
      source.removeEventListener(CATALOG_SSE_EVENT, onCatalogChanged);
      source.close();
    };
  }, [queryClient]);
}
