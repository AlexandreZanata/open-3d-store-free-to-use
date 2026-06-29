import { useQuery } from "@tanstack/react-query";

import { fetchShopConfig } from "@/lib/api/shop-config";

export const shopConfigQueryKey = ["shop", "config"] as const;

export function useShopConfig() {
  return useQuery({
    queryKey: shopConfigQueryKey,
    queryFn: fetchShopConfig,
    staleTime: 5 * 60 * 1000,
  });
}
