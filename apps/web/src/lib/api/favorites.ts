import type { FavoriteListResponse, FavoriteToggleResult } from "@print3d/shared-types";

import { apiDelete, apiFetch, apiPost } from "@/lib/api/client";
import { visitorHeaders } from "@/lib/visitor";

export async function fetchFavorites(): Promise<FavoriteListResponse> {
  return apiFetch<FavoriteListResponse>("/favorites", {
    headers: visitorHeaders(),
  });
}

export async function addFavorite(productId: string): Promise<FavoriteToggleResult> {
  const response = await apiPost<{ data: FavoriteToggleResult }>(
    `/favorites/${productId}`,
    {},
    { headers: visitorHeaders() },
  );
  return response.data;
}

export async function removeFavorite(productId: string): Promise<FavoriteToggleResult> {
  const response = await apiDelete<{ data: FavoriteToggleResult }>(
    `/favorites/${productId}`,
    { headers: visitorHeaders() },
  );
  return response.data;
}
