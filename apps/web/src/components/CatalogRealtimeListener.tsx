import { useQueryClient } from "@tanstack/react-query";

import { useCatalogRealtime } from "@/hooks/useCatalogRealtime";

export function CatalogRealtimeListener() {
  const queryClient = useQueryClient();
  useCatalogRealtime(queryClient);
  return null;
}
