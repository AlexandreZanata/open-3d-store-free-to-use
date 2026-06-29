# Admin API Contract v1

> Contract-first. Implement handlers in Phase 12+ only after this document and `@print3d/shared-types` admin types are stable.  
> Public catalog: [contract.md](contract.md). Auth ADR: [../adr/001-admin-authentication.md](../adr/001-admin-authentication.md). Namespace ADR: [../adr/002-admin-api-namespace.md](../adr/002-admin-api-namespace.md).

## Base URL

| Environment | URL |
|-------------|-----|
| Production | `https://yourdomain.com/api/v1/admin` |
| Development | `http://localhost:3001/api/v1/admin` |

All routes prefixed `/api/v1/admin`. Version in path — never omit.

## Authentication

Session cookie `print3d_admin_session` (see ADR 001). Browser clients MUST send `credentials: 'include'`.

| Route | Auth required |
|-------|---------------|
| `POST /auth/login` | No |
| `POST /auth/logout` | Yes |
| `GET /auth/me` | Yes |
| `POST /auth/refresh` | Yes |
| All other `/admin/*` | Yes |

Unauthenticated request to protected route → **401** RFC 7807.

Authenticated but insufficient role → **403** RFC 7807 (MVP: only `admin` role exists).

## Rate limiting

Counters use Redis (`@fastify/rate-limit`). Response **429** includes `Retry-After` when limited.

| Scope | Environment | Limit | Key |
|-------|-------------|-------|-----|
| **Global API** | Production | 100 req / IP / minute | `{PORT}:global:{ip}` |
| **Global API** | Development | **Disabled** | — |
| **`POST /auth/login`** | All | 5 req / IP / minute | `admin-login:{ip}` |
| **`GET /auth/me`**, **`POST /auth/refresh`** | All | **Excluded** | — |
| **Public `POST /orders/capture`** | All | 10 req / IP / minute | per-route |

Development disables the global bucket so local admin navigation (dashboard queries + session checks) does not hit 429. **Restart the API** after pulling changes — an old process keeps the previous limits.

Login remains limited in all environments. Production storefront + admin traffic share the global bucket per IP.

## Internationalization

Admin **write** payloads include bilingual catalog text:

```json
"translations": {
  "en": { "name": "…", "description": "…" },
  "pt-BR": { "name": "…", "description": "…" }
}
```

Both `en` and `pt-BR` keys are **required** on create. PATCH may update one locale branch without omitting the other (merge server-side).

Admin error responses honor `Accept-Language: en` or `pt-BR` (same rules as public API).

## Error format (RFC 7807)

Same shape as public API. Common admin `type` URIs:

| Status | type suffix | When |
|--------|-------------|------|
| 400 | `/bad-request` | Malformed JSON or multipart |
| 401 | `/unauthorized` | Missing or expired session |
| 403 | `/forbidden` | Valid session, not admin |
| 404 | `/not-found` | Resource ID/slug not found |
| 422 | `/validation-failed` | Zod / business rule failure |
| 429 | `/rate-limit` | Too many requests |
| 500 | `/internal` | Unexpected server error |

**Contract tests:** assert status codes and JSON shapes from **this document only** — [../testing/contract-first-testing.md](../testing/contract-first-testing.md).

## Non-writable fields (mass-assignment)

Clients MUST NOT send these on create/update (server ignores or returns 422):

`id`, `createdAt`, `updatedAt`, `passwordHash`, `role`, `lastLoginAt`, `search_vector_en`, `search_vector_pt`

---

## Auth

### `POST /auth/login`

Rate limit: **5 requests / IP / minute**.

**Request 200 body:**

```json
{
  "email": "admin@example.com",
  "password": "change-me-in-dev"
}
```

**Response 200:**

```json
{
  "data": {
    "id": "01935…",
    "email": "admin@example.com",
    "role": "admin",
    "lastLoginAt": "2026-06-28T12:00:00.000Z"
  }
}
```

Sets `Set-Cookie: print3d_admin_session=…; HttpOnly; Path=/api/v1/admin; SameSite=Strict`.

**Response 401:** Invalid credentials (same body shape for unknown email vs wrong password).

**Response 422:** Invalid email format or password too short.

---

### `POST /auth/logout`

**Response 204:** Clears session cookie. No body.

**Response 401:** No active session.

---

### `GET /auth/me`

**Response 200:**

```json
{
  "data": {
    "id": "01935…",
    "email": "admin@example.com",
    "role": "admin",
    "lastLoginAt": "2026-06-28T12:00:00.000Z"
  }
}
```

**Response 401:** Not authenticated.

Not counted toward the global API rate limit (session validation only).

---

### `POST /auth/refresh`

Extends the sliding session idle window (ADR 001: `ADMIN_SESSION_IDLE_TTL`, capped by `ADMIN_SESSION_TTL` from login). Called by the admin SPA on a timer while the user is active.

**Response 200:** Same body as `GET /auth/me`.

**Response 401:** Not authenticated or session expired.

Not counted toward the global API rate limit.

---

## Products

### `GET /products`

Paginated list (includes all statuses).

| Param | Type | Default | Max |
|-------|------|---------|-----|
| `page` | integer | 1 | — |
| `limit` | integer | 20 | 100 |
| `status` | string | — | `active`, `out_of_stock`, `discontinued` |
| `category` | string | — | Category slug filter |
| `q` | string | — | Search slug/name |

**Response 200:**

```json
{
  "data": [
    {
      "id": "01935…",
      "slug": "custom-photo-frame",
      "categoryId": "01934…",
      "basePrice": 4500,
      "material": "PETG",
      "printTimeHours": 4,
      "weightGrams": 120,
      "status": "active",
      "thumbnailUrl": "/models/thumbnails/photo-frame.webp",
      "modelFileUrl": "/models/3d/photo-frame.glb",
      "tags": ["gifts"],
      "translations": {
        "en": {
          "name": "Custom Photo Frame",
          "description": "Full description…",
          "shortDescription": "Photo frame with embossed name"
        },
        "pt-BR": {
          "name": "Porta-retrato personalizado",
          "description": "Descrição completa…",
          "shortDescription": "Porta-retrato com nome em relevo"
        }
      },
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "totalPages": 1,
    "limit": 20
  }
}
```

---

### `GET /products/:id`

**Response 200:** Full admin product (list fields plus `options`, `imageUrls`).

```json
{
  "data": {
    "id": "01935…",
    "slug": "custom-photo-frame",
    "categoryId": "01934…",
    "basePrice": 4500,
    "material": "PETG",
    "printTimeHours": 4,
    "weightGrams": 120,
    "status": "active",
    "options": [
      {
        "id": "opt-color",
        "name": "Color",
        "type": "select",
        "required": true,
        "choices": ["White", "Black"]
      }
    ],
    "modelFileUrl": "/models/3d/photo-frame.glb",
    "thumbnailUrl": "/models/thumbnails/photo-frame.webp",
    "imageUrls": ["/models/images/photo-frame-1.webp"],
    "tags": ["gifts"],
    "translations": { "en": { "…": "…" }, "pt-BR": { "…": "…" } },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Response 404:** Product not found.

---

### `POST /products`

**Request 201 body:**

```json
{
  "slug": "custom-photo-frame",
  "categoryId": "01934…",
  "basePrice": 4500,
  "material": "PETG",
  "printTimeHours": 4,
  "weightGrams": 120,
  "status": "active",
  "options": [],
  "modelFileUrl": null,
  "thumbnailUrl": "/models/thumbnails/photo-frame.webp",
  "imageUrls": [],
  "tags": [],
  "translations": {
    "en": {
      "name": "Custom Photo Frame",
      "description": "Full description…",
      "shortDescription": "Photo frame with embossed name"
    },
    "pt-BR": {
      "name": "Porta-retrato personalizado",
      "description": "Descrição completa…",
      "shortDescription": "Porta-retrato com nome em relevo"
    }
  }
}
```

Validation:

- `slug`: unique, 2–100 chars, lowercase hyphenated
- `basePrice`: integer ≥ 0 (BRL cents)
- `translations.en` and `translations.pt-BR`: required keys `name`, `description`, `shortDescription` (non-empty strings)
- `categoryId`: must exist

**Response 201:** Same shape as `GET /products/:id` `data` object wrapped in `{ "data": … }`.

**Response 409:** Slug already exists.

**Response 422:** Validation failure.

---

### `PATCH /products/:id`

Partial update. Omitted fields unchanged. `translations` merges per locale key.

**Response 200:** Updated product (`data` wrapper).

**Response 404** / **422** / **409** as above.

---

### `DELETE /products/:id`

**Behavior:** Hard delete only when no `order_captures` reference the product; otherwise **409** with detail suggesting `status: discontinued`.

**Response 204:** Deleted.

**Response 404:** Not found.

---

## Categories

### `GET /categories`

**Response 200:**

```json
{
  "data": [
    {
      "id": "01934…",
      "slug": "miniatures",
      "parentId": null,
      "imageUrl": "/models/thumbnails/miniatures.webp",
      "sortOrder": 1,
      "isActive": true,
      "translations": {
        "en": { "name": "Miniatures", "description": "Custom figurines" },
        "pt-BR": { "name": "Miniaturas", "description": "Figurinhas personalizadas" }
      },
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /categories/:id`

**Response 200:** Single category (same object shape as list item).

**Response 404**

---

### `POST /categories`

**Request 201:**

```json
{
  "slug": "miniatures",
  "parentId": null,
  "imageUrl": "/models/thumbnails/miniatures.webp",
  "sortOrder": 1,
  "isActive": true,
  "translations": {
    "en": { "name": "Miniatures", "description": "Custom figurines" },
    "pt-BR": { "name": "Miniaturas", "description": "Figurinhas personalizadas" }
  }
}
```

**Response 201:** `{ "data": { … } }`

---

### `PATCH /categories/:id`

Partial update. Setting `isActive: false` soft-deletes (hidden from public catalog).

**Response 200**

---

### `DELETE /categories/:id`

**Behavior:** Soft-delete — sets `isActive: false`. Fails **409** if active products still reference category.

**Response 204**

---

## Orders (read-only)

### `GET /orders`

| Param | Type | Default |
|-------|------|---------|
| `page` | integer | 1 |
| `limit` | integer | 20 (max 50) |
| `from` | ISO date | — |
| `to` | ISO date | — |

**Response 200:**

```json
{
  "data": [
    {
      "id": "01935abc…",
      "itemCount": 2,
      "totalCents": 9000,
      "totalDisplay": "R$ 90,00",
      "customerName": "Maria",
      "capturedAt": "2026-06-28T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "totalPages": 1,
    "limit": 20
  }
}
```

---

### `GET /orders/:id`

**Response 200:**

```json
{
  "data": {
    "id": "01935abc…",
    "items": [
      {
        "productId": "01935…",
        "productName": "Custom Photo Frame",
        "quantity": 2,
        "selectedOptions": { "Color": "White" },
        "unitPrice": 4500
      }
    ],
    "customerName": "Maria",
    "customerNote": "Need fast delivery",
    "totalCents": 9000,
    "totalDisplay": "R$ 90,00",
    "whatsappLink": "https://wa.me/5565999999999?text=…",
    "capturedAt": "2026-06-28T10:00:00.000Z"
  }
}
```

**Response 404**

---

## Uploads

### `POST /uploads`

`multipart/form-data`

| Field | Required | Description |
|-------|----------|-------------|
| `file` | Yes | Binary file |
| `kind` | Yes | `thumbnail` \| `gallery` \| `model` |

Parts may arrive in any order; the server reads the full multipart stream.

**MIME allowlist:**

| kind | Accepted upload MIME | Stored as |
|------|----------------------|-----------|
| `thumbnail`, `gallery` | `image/webp`, `image/jpeg`, `image/png` | `image/webp` (`.webp`) |
| `model` | `model/gltf-binary`, `model/gltf+json` | same (`.glb`, `.gltf`) |

JPEG and PNG uploads are converted server-side to WebP before storage (catalog asset convention).

Browsers may send non-standard MIME types (`image/jpg`, `application/octet-stream`); the API resolves type from extension and file signature.

In development, if `MODEL_FILES_BASE_PATH` is not writable (e.g. `/var/www/...`), the API falls back to `apps/api/storage/models`.

**Size limits** (see `UPLOAD_MAX_BYTES`):

| kind | Max size |
|------|----------|
| `thumbnail` | 512 KB |
| `gallery` | 2 MB |
| `model` | 5 MB |

Files stored under `UPLOAD_DIR` mirroring [../features/3d-viewer.md](../features/3d-viewer.md):

- `thumbnail` → `thumbnails/`
- `gallery` → `images/`
- `model` → `3d/`

**Response 201:**

```json
{
  "data": {
    "url": "/models/thumbnails/upload-01935.webp",
    "mimeType": "image/webp",
    "sizeBytes": 42000,
    "kind": "thumbnail"
  }
}
```

**Response 400:** Missing file or invalid multipart.

**Response 422:** MIME not allowed or file too large.

---

## Audit events (implementation note)

Not exposed via REST in MVP. Emitted server-side per [../architecture/domain-model.md](../architecture/domain-model.md#auditlog):

| Action | Trigger |
|--------|---------|
| `admin.login.success` / `admin.login.failure` | Auth |
| `admin.product.created` / `updated` / `deleted` | Product mutations |
| `admin.category.created` / `updated` / `deleted` | Category mutations |
| `admin.upload.completed` | Upload |

---

## Related documents

- [contract.md](contract.md) — public API
- [../architecture/domain-model.md](../architecture/domain-model.md)
- [../features/i18n.md](../features/i18n.md)
- [../features/3d-viewer.md](../features/3d-viewer.md)
- [../infrastructure/environment.md](../infrastructure/environment.md)
- `@print3d/shared-types` — `src/admin/*`
