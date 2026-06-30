# API Contract v1

> Contract-first. Define before handler code. See `agent-rules/10-api-design/contract-first.md`.

## Base URL

| Environment | URL |
|-------------|-----|
| Production | `https://yourdomain.com/api/v1` |
| Development | `http://localhost:3001/api/v1` |

All routes prefixed `/api/v1`. Version in path — never omit.

## Authentication

**None** for public catalog and order capture. Anonymous browsing and order intent only.

Admin endpoints live under `/api/v1/admin/*` with session auth — see [admin-contract.md](admin-contract.md) and [../adr/001-admin-authentication.md](../adr/001-admin-authentication.md).

## Internationalization

All public endpoints honor **`Accept-Language: en`** or **`Accept-Language: pt-BR`**. Optional override: `?locale=en|pt-BR`.

| Behavior | Detail |
|----------|--------|
| Catalog fields | Resolved from entity `translations` JSONB |
| RFC 7807 errors | `title` and `detail` localized |
| Response meta | Include `"locale": "en"` or `"locale": "pt-BR"` on catalog payloads |
| Default | `pt-BR` when header missing or unsupported |
| Unsupported locale | Fall back to `en`, then `pt-BR` |

Full policy: [../features/i18n.md](../features/i18n.md).

---

## Error format (RFC 7807)

```json
{
  "type": "https://yourdomain.com/errors/not-found",
  "title": "Product not found",
  "status": 404,
  "detail": "No product with slug 'non-existent' exists"
}
```

Harness: `agent-rules/06-reliability-and-observability/exception-handling-discipline.md`

**Contract tests:** HTTP integration and E2E tests for this API MUST assert shapes and status codes from **this document only** — see [../testing/contract-first-testing.md](../testing/contract-first-testing.md). Do not derive expectations from handler implementation.

## OpenAPI / Swagger

Interactive docs (development only): [swagger.md](swagger.md) — UI at `http://127.0.0.1:3001/docs` when `pnpm --filter @print3d/api dev` is running.

---

## `GET /health`

**Response 200:**

```json
{ "status": "ok", "uptime": 12345, "timestamp": "2025-01-01T00:00:00.000Z" }
```

No cache. Used by CI/CD and uptime monitors.

---

## `GET /categories`

Returns active categories sorted by `sortOrder`.

**Response 200:**

```json
{
  "data": [
    {
      "id": "01935...",
      "slug": "miniatures",
      "name": "Miniatures",
      "description": "Custom figurines and miniatures",
      "parentId": null,
      "imageUrl": "/models/thumbnails/miniatures.webp",
      "sortOrder": 1
    }
  ]
}
```

**Cache:** `Cache-Control: public, max-age=300`

---

## `GET /products`

### Query parameters

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `page` | integer | 1 | — | 1-indexed |
| `limit` | integer | 20 | 50 | Page size |
| `category` | string | — | — | Category slug |
| `material` | string | — | — | `PLA`, `PETG`, `PETG_HF`, `ABS`, `ASA`, `TPU`, `NYLON`, `RESIN` |
| `status` | string | `active` | — | `active`, `out_of_stock`, `discontinued` |
| `featured` | string | — | — | `true` — only products marked featured in admin (`is_featured`) |
| `q` | string | — | — | Full-text search |
| `minPrice` | integer | — | — | BRL cents |
| `maxPrice` | integer | — | — | BRL cents |

**Response 200:**

```json
{
  "data": [
    {
      "id": "01935...",
      "slug": "custom-photo-frame",
      "name": "Custom Photo Frame",
      "shortDescription": "Photo frame with embossed name",
      "categoryId": "01934...",
      "basePrice": 4500,
      "basePriceDisplay": "R$ 45,00",
      "material": "PETG",
      "status": "active",
      "thumbnailUrl": "/models/thumbnails/photo-frame.webp",
      "hasModel": true,
      "tags": ["gifts", "custom"]
    }
  ],
  "pagination": {
    "total": 47,
    "page": 1,
    "totalPages": 3,
    "limit": 20
  }
}
```

**Cache:** `Cache-Control: public, max-age=120`

**Featured rail:** Home storefront uses `GET /products?featured=true&limit=6` — only admin-featured active products appear in the “Featured products” section.

---

## `GET /products/:slug`

Full product detail including options and model URL.

**Response 200:** Full product object with `options[]`, `modelFileUrl` (viewer-optimized GLB when `-preview.glb` exists on disk), `imageUrls[]`, `printTimeHours`, `weightGrams`.

**Response 404:** RFC 7807 problem detail.

**Cache:** `Cache-Control: public, max-age=600`

---

## `POST /orders/capture`

Anonymous. No auth header.

### Request body

```json
{
  "items": [
    {
      "productId": "01935...",
      "quantity": 2,
      "selectedOptions": {
        "Color": "White",
        "Name to engrave": "John"
      }
    }
  ],
  "customerName": "Maria",
  "customerNote": "Need fast delivery"
}
```

Validation: Zod at HTTP boundary. Required product options MUST be present. **No auth required** — guests and signed-in shoppers use the same endpoint. The web UI requires `customerName` for guests; signed-in shoppers send profile `displayName` automatically.

### Response 201

```json
{
  "data": {
    "orderId": "01935abc...",
    "whatsappLink": "https://wa.me/5565999999999?text=...",
    "totalPrice": "R$ 90,00",
    "summary": "2x Custom Photo Frame (White, John)"
  }
}
```

**Rate limit:** 10 requests / IP / minute.

Harness: `agent-rules/10-api-design/idempotency.md` — consider `Idempotency-Key` in v2 if duplicate orders become an issue.

---

## Frontend integration (Phase 7 — complete)

| Legacy mock | Current implementation |
|-------------|------------------------|
| `src/lib/products.ts` | Removed — use `src/lib/api/*` + React Query hooks |
| `src/routes/product.$id.tsx` | `src/routes/product.$slug.tsx` |
| `src/routes/cart.tsx` | POST `/orders/capture` → redirect to WhatsApp |

Web env: `apps/web/.env.example` (`VITE_API_BASE_URL`, `VITE_ASSETS_BASE_URL`).

---

## `GET /shop/config`

Public shop policy for storefront (materials offered, fulfillment, payments, deposit rules). Cache: `public, max-age=300`.

**Response 200:**

```json
{
  "data": {
    "enabledMaterials": ["PLA", "PETG", "PETG_HF"],
    "catalogMaterials": ["PETG_HF"],
    "availableColors": [
      { "id": "pla-white", "name": "White", "hex": "#F5F5F5" }
    ],
    "offersDelivery": false,
    "pickupOnly": true,
    "pickupLocation": "Pickup at the studio — Cuiabá, MT",
    "paymentMethods": ["pix", "credit_card"],
    "requiresDeposit": true,
    "depositPercent": 50
  }
}
```

Admin write: [admin-contract.md](admin-contract.md) — `GET/PATCH /admin/settings`.

`catalogMaterials` — distinct `material` values from **active** products (search page material filter).

---

## Storefront accounts (session)

Optional shopper accounts for cart and favorites persistence. Full guide: [../features/store-user-accounts.md](../features/store-user-accounts.md).

| Cookie | Path | Detail |
|--------|------|--------|
| `print3d_store_session` | `/api/v1` | HttpOnly session token |

| Header | Required | Detail |
|--------|----------|--------|
| `X-Device-Id` | Register only | UUID v4 — max 2 accounts per device |
| `X-Visitor-Id` | Favorites (anonymous) | Merged into account on register/login |

**Registration limit:** max 2 accounts per IP **and** max 2 per device → **403** `registrationLimit`.

### `POST /auth/register`

**Response 201:**

```json
{
  "data": {
    "id": "01935...",
    "email": "maria@example.com",
    "displayName": "Maria",
    "cart": [],
    "checkoutNote": null
  }
}
```

Sets session cookie. Optional body `cart[]` merges with server cart. Optional `checkoutNote` persists default shop note.

### `POST /auth/login`

**Response 200:** Same shape as register. Sets session cookie.

### `POST /auth/logout`

**Response 204.** Clears session cookie. Requires session.

### `GET /me`

Requires session cookie (`print3d_store_session`). **Response 401:** not signed in.

The web app **does not call** `GET /me` for anonymous visitors (no `print3d-store-session-hint` in localStorage). The hint is set after login/register and cleared on logout. Shoppers with an existing HttpOnly session from before this behavior may need to sign in once to restore client state.

**Response 200:**

```json
{
  "data": {
    "id": "01935...",
    "email": "maria@example.com",
    "displayName": "Maria",
    "cart": [],
    "checkoutNote": "Please call before delivery"
  }
}
```

### `PATCH /me`

Body: `{ "displayName"?: "Maria", "checkoutNote"?: "..." | null }` — at least one field required. **Response 200:** same as `GET /me`.

### `PUT /me/cart`

Body: `{ "cart": [ /* StoreCartItem[] */ ] }` — **Response 200:** `{ "data": { "cart": [] } }`.

---

## Favorites (visitor or account)

Anonymous favorites keyed by **`X-Visitor-Id`** (UUID v4) **or** session cookie when signed in.

The web app **does not call** `GET /favorites` for guests with an empty local cache. After the first favorite (or when signed in), it syncs with the API. Invalid legacy visitor ids (non-UUID) are replaced client-side on next access.

| Header | Required | Detail |
|--------|----------|--------|
| `X-Visitor-Id` | Yes (if no session) | UUID v4 string |

### `GET /favorites`

Returns favorited active products for the visitor, newest first.

**Response 200:**

```json
{
  "data": [
    {
      "id": "01935...",
      "slug": "custom-photo-frame",
      "name": "Custom Photo Frame",
      "shortDescription": "...",
      "material": "PLA",
      "basePriceDisplay": "R$ 45,00",
      "thumbnailUrl": "/uploads/...",
      "hasModel": true,
      "status": "active"
    }
  ],
  "meta": {
    "count": 1,
    "productIds": ["01935..."]
  }
}
```

**Response 400:** missing or invalid `X-Visitor-Id` (RFC 7807).

### `POST /favorites/:productId`

Adds a favorite. Idempotent per visitor/product pair.

**Response 201:**

```json
{
  "data": {
    "productId": "01935...",
    "favorited": true
  }
}
```

**Response 404:** product not found or not active.

### `DELETE /favorites/:productId`

Removes a favorite.

**Response 200:**

```json
{
  "data": {
    "productId": "01935...",
    "favorited": false
  }
}
```

---

## `GET /catalog/events` (SSE)

Public Server-Sent Events stream for catalog changes after admin writes. Full spec: [../features/catalog-realtime.md](../features/catalog-realtime.md).

| Property | Value |
|----------|-------|
| Auth | None |
| Response | `text/event-stream` |
| Event | `catalog.changed` |

**Example:**

```text
event: catalog.changed
data: {"type":"catalog.changed","resource":"product","action":"updated","slug":"photo-frame","at":"2026-06-29T12:00:00.000Z"}
```

Phase 7: `.local/phases/07-frontend-integration.md`

## Related documents

- [admin-contract.md](admin-contract.md) — authenticated admin API
- [../architecture/domain-model.md](../architecture/domain-model.md)
- [../features/whatsapp-flow.md](../features/whatsapp-flow.md)
- [../operations/performance-caching.md](../operations/performance-caching.md)
- `agent-rules/10-api-design/rest-conventions.md`
