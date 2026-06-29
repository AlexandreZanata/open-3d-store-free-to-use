import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { addFavorite, fetchFavorites, removeFavorite } from "@/lib/api/favorites";

export const favoritesQueryKey = ["favorites"] as const;

export function useFavorites() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: fetchFavorites,
    staleTime: 30_000,
  });

  const favoriteIds = useMemo(
    () => new Set(query.data?.meta.productIds ?? []),
    [query.data?.meta.productIds],
  );

  const toggleMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (favoriteIds.has(productId)) {
        return removeFavorite(productId);
      }
      return addFavorite(productId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    },
  });

  return {
    favorites: query.data?.data ?? [],
    favoriteCount: query.data?.meta.count ?? 0,
    favoriteIds,
    isFavorite: (productId: string) => favoriteIds.has(productId),
    toggleFavorite: toggleMutation.mutateAsync,
    isToggling: toggleMutation.isPending,
    ...query,
  };
}
