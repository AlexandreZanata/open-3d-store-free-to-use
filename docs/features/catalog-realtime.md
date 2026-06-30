# Catalog realtime (SSE)

> Contract: public `GET /api/v1/catalog/events` + admin catalog mutations.  
> Storefront client: `apps/web/src/hooks/useCatalogRealtime.ts`.

## Purpose

When an admin creates, updates, or deletes a **product** or **category**, connected storefront clients receive a Server-Sent Event and refresh React Query catalog caches without a manual reload.

Orders and auth changes are **out of scope** — they do not affect the public catalog UI.

## API

### `GET /catalog/events`

| Property | Value |
|----------|-------|
| Auth | None (public) |
| Content-Type | `text/event-stream` |
| Event name | `catalog.changed` |
| Heartbeat | `: ping` comment every 25s |

**Example event:**

```text
event: catalog.changed
data: {"type":"catalog.changed","resource":"product","action":"updated","slug":"photo-frame","id":"019f…","at":"2026-06-29T12:00:00.000Z"}
```

| Field | Values |
|-------|--------|
| `resource` | `catalog` \| `product` \| `category` |
| `action` | `created` \| `updated` \| `deleted` |
| `slug` | Present when `resource` is `product` |
| `id` | Admin entity id when known |

Published via Redis channel `v1:catalog:events` after `CatalogCacheInvalidator` runs on admin writes. Works across multiple API instances (PM2 cluster).

## Storefront behavior

`useCatalogRealtime` opens `EventSource` once at the app root and invalidates:

- `["products"]`
- `["categories"]`
- `["product"]`

TanStack Query refetches visible pages automatically. The storefront API client uses `cache: "no-store"` on `fetch` so browser HTTP cache (API `Cache-Control` up to 600s on product detail) does not block realtime updates.

### Client cache policy

| Setting | Value | Purpose |
|---------|-------|---------|
| `staleTime` | 5 min | Avoid refetch on home ↔ product navigation |
| `gcTime` | 30 min | Keep catalog in memory while browsing |
| `placeholderData: keepPreviousData` | products, categories, product detail | SSE refetch keeps last data on screen |
| SSE `refetchType` | `active` | Refetch only mounted views; stale cache still updates on return |
| Skeleton gate | `isCatalogQueryPending` | Blank skeleton only when `data === undefined` |
| Thumbnails | `CatalogThumbnail` + `warmHomeCatalogImages` | Session image pool keeps **decoded** bitmaps; tiles must not show `opacity-100` until decode is confirmed |

When `catalog.changed` fires, queries are **invalidated** (marked stale) and active observers refetch in the background — the UI must not flash empty lists while refetching.

### Thumbnail warm cache

`catalogThumbnailCache` preloads home/category thumbnail URLs into an in-memory `Image` pool (`warmHomeCatalogImages` on home loader + data updates).

| Rule | Requirement |
|------|-------------|
| Warm definition | A URL is warm only after its pool `Image` fires `onload` with `naturalWidth > 0` |
| Failed preload | `onerror` must **not** mark the URL warm (retry on next navigation) |
| Remounted tiles | `CatalogThumbnail` must detect browser-cached decode (`img.complete`) **before paint** (`useLayoutEffect`) |
| Visibility gate | Never use `opacity-0` on catalog thumbnails — muted tile background only while bytes load |
| Return navigation | Home → product (or any page) → home within `gcTime`: thumbnails visible within **300 ms** — no multi-second blank or gray tiles |

Changed thumbnail URLs after SSE still reload normally; unchanged URLs must reuse the session pool or HTTP cache without a blank flash.

## Development

```bash
# API — set CORS_ORIGIN to the storefront URL (match host: 127.0.0.1 vs localhost)
export CORS_ORIGIN=http://127.0.0.1:5176
set -a && source apps/api/.env && set +a
PORT=3025 pnpm --filter @print3d/api dev

# Storefront — omit VITE_ASSETS_BASE_URL; Vite proxies /models to the API
cp apps/web/.env.example apps/web/.env   # set VITE_API_BASE_URL to your API port
pnpm --filter @print3d/web exec vite dev --host 127.0.0.1 --port 5176
```

Do **not** set `VITE_ASSETS_BASE_URL` to the API host in dev — the browser blocks cross-origin image loads (`OpaqueResponseBlocking`). Use same-origin `/models/...` via the Vite proxy instead.

Manual check:

1. Open `http://127.0.0.1:5176/` and a product detail page.
2. In admin, edit the product name and save.
3. Storefront title/list updates within a few seconds without refresh.

## Tests

| Layer | File |
|-------|------|
| API integration | `apps/api/tests/integration/routes/catalog-events.routes.test.ts` |
| Web unit | `apps/web/tests/unit/useCatalogRealtime.test.ts`, `apps/web/tests/unit/catalogQuery.test.ts`, `apps/web/tests/unit/catalogThumbnailCache.test.ts`, `apps/web/tests/unit/CatalogThumbnail.test.tsx` |
| E2E | `e2e/catalog-realtime.spec.ts`, `e2e/catalog-navigation.spec.ts` |

**Note:** SSE responses set `Access-Control-Allow-Origin` manually (`buildSseCorsHeaders`) because `reply.hijack()` bypasses `@fastify/cors`.

## Related

- [../api/contract.md](../api/contract.md)
- [../api/admin-contract.md](../api/admin-contract.md)
- [admin-panel.md](admin-panel.md)
