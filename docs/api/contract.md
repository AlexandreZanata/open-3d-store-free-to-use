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

Future admin endpoints (out of scope v1) will require separate auth — document in ADR before adding.

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
| `material` | string | — | — | `PLA`, `PETG`, `ABS`, `TPU`, `RESIN` |
| `status` | string | `active` | — | `active`, `out_of_stock` |
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

---

## `GET /products/:slug`

Full product detail including options and model URL.

**Response 200:** Full product object with `options[]`, `modelFileUrl`, `imageUrls[]`, `printTimeHours`, `weightGrams`.

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

Validation: Zod at HTTP boundary. Required product options MUST be present.

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

Phase 7: `.local/phases/07-frontend-integration.md`

## Related documents

- [../architecture/domain-model.md](../architecture/domain-model.md)
- [../features/whatsapp-flow.md](../features/whatsapp-flow.md)
- [../operations/performance-caching.md](../operations/performance-caching.md)
- `agent-rules/10-api-design/rest-conventions.md`
