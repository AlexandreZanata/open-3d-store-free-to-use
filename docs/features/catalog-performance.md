# Mobile catalog performance

> Contract for storefront catalog prefetch on mobile bottom-nav routes.  
> Visual layout and business logic are unchanged — only fetch timing improves.

## Problem

On mobile (Slow 3G / VPS latency), bottom-nav tab switches to **Search** or **Categories** could show a blank catalog while React Query fetched after navigation. Home prefetched catalog data; other tabs did not consistently warm the same cache keys.

## Scope

| In scope | Out of scope |
|----------|--------------|
| React Query prefetch / `ensureQueryData` on tab routes | API `Cache-Control` headers |
| Idle mobile warmup after `AppShell` mount | Service worker / CDN |
| `pointerdown` prefetch on bottom-nav tabs | Visual or business-logic changes |
| Defer hero GLB preload off non-home routes | Bottom tab bar viewport pinning (see [responsive-layout.md](responsive-layout.md)) |

## Shared query params

Route loaders, hooks, and prefetch helpers **MUST** use the same keys from `apps/web/src/lib/catalogPrefetch.ts`:

| Tab / route | Products params | Categories |
|-------------|-----------------|------------|
| Home `/` | `{ page: 1, limit: 12 }` + `{ featured: true, limit: 6, page: 1 }` | yes |
| Search `/search` | `{ page: 1, limit: 24 }` | — |
| Categories `/categories` | `{ page: 1, limit: 50 }` | yes |

Query keys: `productsQueryKey(params, locale)` and `categoriesQueryKey(locale)` — same as `useProducts` / `useCategories`.

## Prefetch triggers

| Trigger | When | Mobile only |
|---------|------|-------------|
| Route loader | Navigation to `/`, `/search`, `/categories` | no |
| `scheduleMobileCatalogPrefetch` | `AppShell` mount, `requestIdleCallback` (2s timeout fallback) | yes |
| `prefetchMobileTabRoute` | Bottom-nav `pointerdown` before navigation | yes |
| Favorites prefetch | Only when `shouldSyncFavorites` is true (auth or cached ids) | yes |

Guests MUST NOT prefetch `GET /api/v1/favorites` (see [store-user-accounts.md](store-user-accounts.md)).

## Hero logo (main-thread)

`HeroLogoViewer` MUST NOT call `preloadHeroLogo()` on mount globally. GLB + Three.js warm only when the hero slot is visible (`attachHeroLogoSlot` + home route loader). Root shell MUST NOT preload hero on every page.

## Acceptance criteria

| Scenario | Target |
|----------|--------|
| Warm tab switch (visited or prefetched) | Cached catalog visible within **100 ms** (lab); E2E decode bound **3 s** on CI (no multi-second blank tiles) |
| Search → Home → Search round-trip | Catalog tiles decoded within **5 s** total on CI |
| Cold home load (seeded DB) | Product thumbnail decoded within **5 s** |
| Tab bar viewport pinning | No regression — `e2e/mobile-ux.spec.ts` |

Skeleton rules unchanged: `isCatalogQueryPending` — blank skeleton only when `data === undefined` ([catalog-realtime.md](catalog-realtime.md)).

## Key files

| File | Role |
|------|------|
| `apps/web/src/lib/catalogPrefetch.ts` | Shared params + prefetch helpers |
| `apps/web/src/hooks/useMobileCatalogPrefetch.ts` | Idle warmup hook |
| `apps/web/src/components/AppShell.tsx` | Mounts idle prefetch |
| `apps/web/src/components/AppShellMobileNav.tsx` | Tab `pointerdown` prefetch |
| `apps/web/src/routes/search.tsx` | Search loader |
| `apps/web/src/routes/categories.tsx` | Categories loader |

## Testing

| Layer | File |
|-------|------|
| Unit | `apps/web/tests/unit/catalogPrefetch.test.ts` |
| E2E mobile | `e2e/catalog-performance.spec.ts` |
| Regression | `e2e/mobile-ux.spec.ts` (tab bar flush) |

```bash
pnpm --filter @print3d/web test apps/web/tests/unit/catalogPrefetch.test.ts
PLAYWRIGHT_SKIP_WEBSERVER=1 PLAYWRIGHT_BASE_URL=http://localhost:5173 pnpm e2e e2e/catalog-performance.spec.ts
```

## Related

- [responsive-layout.md](responsive-layout.md)
- [catalog-realtime.md](catalog-realtime.md)
