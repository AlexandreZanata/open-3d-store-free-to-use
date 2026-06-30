import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FavoriteListResponse } from "@print3d/shared-types";
import { useMemo } from "react";

import { useStoreAuth } from "@/auth/useStoreAuth";
import { addFavorite, fetchFavorites, removeFavorite } from "@/lib/api/favorites";
import {
  buildPlaceholderFavorites,
  readCachedFavoriteIds,
  writeCachedFavoriteIds,
} from "@/lib/favoriteCache";
import { shouldSyncFavorites } from "@/lib/favoritesSync";

export const favoritesQueryKey = ["favorites"] as const;

export function useFavorites() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useStoreAuth();
  const cachedFavoriteIds = readCachedFavoriteIds();
  const syncEnabled = shouldSyncFavorites(isAuthenticated, cachedFavoriteIds.length);

  const query = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: fetchFavorites,
    staleTime: 30_000,
    enabled: syncEnabled,
    placeholderData: () => buildPlaceholderFavorites(cachedFavoriteIds),
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
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });
      const previous = queryClient.getQueryData<FavoriteListResponse>(favoritesQueryKey);
      const wasFavorite = previous?.meta.productIds.includes(productId) ?? false;
      const nextIds = wasFavorite
        ? (previous?.meta.productIds ?? []).filter((id) => id !== productId)
        : [...(previous?.meta.productIds ?? []), productId];
      const nextData = wasFavorite
        ? (previous?.data ?? []).filter((item) => item.id !== productId)
        : (previous?.data ?? []);

      writeCachedFavoriteIds(nextIds);
      queryClient.setQueryData<FavoriteListResponse>(favoritesQueryKey, {
        data: nextData,
        meta: { count: nextIds.length, productIds: nextIds },
      });
      return { previous };
    },
    onError: (_error, _productId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(favoritesQueryKey, context.previous);
        writeCachedFavoriteIds(context.previous.meta.productIds);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    },
    onSettled: async () => {
      const latest = queryClient.getQueryData<FavoriteListResponse>(favoritesQueryKey);
      if (latest) {
        writeCachedFavoriteIds(latest.meta.productIds);
      }
    },
  });

  return {
    favorites: query.data?.data ?? [],
    favoriteCount: query.data?.meta.count ?? 0,
    favoriteIds,
    isFavorite: (productId: string) => favoriteIds.has(productId),
    toggleFavorite: toggleMutation.mutateAsync,
    isTogglingProductId: toggleMutation.isPending ? toggleMutation.variables : undefined,
    ...query,
  };
}
