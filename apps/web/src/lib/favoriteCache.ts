import type { FavoriteListResponse } from "@print3d/shared-types";

const FAVORITE_IDS_KEY = "print3d-favorite-ids";

function parseFavoriteIds(raw: string): string[] {
  let parsed: never;
  try {
    parsed = JSON.parse(raw) as never;
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) {
    return [];
  }
  const ids: string[] = [];
  for (const item of parsed as readonly never[]) {
    if (typeof item === "string") {
      ids.push(item);
    }
  }
  return ids;
}

export function readCachedFavoriteIds(): string[] {
  if (typeof localStorage === "undefined") {
    return [];
  }
  const raw = localStorage.getItem(FAVORITE_IDS_KEY);
  if (!raw) {
    return [];
  }
  return parseFavoriteIds(raw);
}

export function writeCachedFavoriteIds(ids: string[]): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(FAVORITE_IDS_KEY, JSON.stringify(ids));
}

export function buildPlaceholderFavorites(ids: string[]): FavoriteListResponse {
  return {
    data: [],
    meta: { count: ids.length, productIds: ids },
  };
}
