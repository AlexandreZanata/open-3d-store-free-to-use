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

## Development

```bash
# API — set CORS_ORIGIN to the storefront URL
export CORS_ORIGIN=http://127.0.0.1:5176
pnpm --filter @print3d/api dev

# Storefront on port 5176 (also http://localhost:5176/)
VITE_API_BASE_URL=http://127.0.0.1:3025/api/v1 pnpm --filter @print3d/web exec vite dev --host 127.0.0.1 --port 5176
```

Manual check:

1. Open `http://127.0.0.1:5176/` and a product detail page.
2. In admin, edit the product name and save.
3. Storefront title/list updates within a few seconds without refresh.

## Tests

| Layer | File |
|-------|------|
| API integration | `apps/api/tests/integration/routes/catalog-events.routes.test.ts` |
| Web unit | `apps/web/tests/unit/useCatalogRealtime.test.ts` |
| E2E | `e2e/catalog-realtime.spec.ts` |

**Note:** SSE responses set `Access-Control-Allow-Origin` manually (`buildSseCorsHeaders`) because `reply.hijack()` bypasses `@fastify/cors`.

## Related

- [../api/contract.md](../api/contract.md)
- [../api/admin-contract.md](../api/admin-contract.md)
- [admin-panel.md](admin-panel.md)
