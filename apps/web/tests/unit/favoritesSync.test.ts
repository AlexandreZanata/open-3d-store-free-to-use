import { describe, expect, it } from "vitest";

import { shouldSyncFavorites } from "../../src/lib/favoritesSync";

/** Contract: docs/features/store-user-accounts.md */
describe("shouldSyncFavorites", () => {
  it("skips API sync for guests with no cached favorites", () => {
    expect(shouldSyncFavorites(false, 0)).toBe(false);
  });

  it("syncs when the shopper is signed in", () => {
    expect(shouldSyncFavorites(true, 0)).toBe(true);
  });

  it("syncs for guests who already favorited locally", () => {
    expect(shouldSyncFavorites(false, 2)).toBe(true);
  });
});
