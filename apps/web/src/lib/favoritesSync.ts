/** When to sync favorites from the API — contract: docs/features/store-user-accounts.md */
export function shouldSyncFavorites(isAuthenticated: boolean, cachedFavoriteCount: number): boolean {
  return isAuthenticated || cachedFavoriteCount > 0;
}
