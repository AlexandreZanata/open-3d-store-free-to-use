import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildPlaceholderFavorites,
  readCachedFavoriteIds,
  writeCachedFavoriteIds,
} from "@/lib/favoriteCache";

describe("favoriteCache", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    });
  });

  it("builds placeholder favorites from cached ids", () => {
    const placeholder = buildPlaceholderFavorites(["a", "b"]);
    expect(placeholder.meta.count).toBe(2);
    expect(placeholder.meta.productIds).toEqual(["a", "b"]);
    expect(placeholder.data).toEqual([]);
  });

  it("persists favorite ids in localStorage", () => {
    writeCachedFavoriteIds(["01935abc"]);
    expect(readCachedFavoriteIds()).toEqual(["01935abc"]);
    writeCachedFavoriteIds([]);
  });
});
