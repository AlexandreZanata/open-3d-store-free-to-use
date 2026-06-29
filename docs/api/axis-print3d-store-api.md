# AXIS Print3D Store API

> Machine-readable spec: Swagger UI at `/docs` when `NODE_ENV !== production`.  
> Human contracts: [contract.md](contract.md) (public) · [admin-contract.md](admin-contract.md) (admin).

OpenAPI title: **AXIS Print3D Store API** (`apps/api/src/http/openapi/registerSwagger.ts`).

## Base URLs

| Environment | Public + Admin prefix |
|-------------|------------------------|
| Development | `http://127.0.0.1:3001/api/v1` |
| Production | `https://yourdomain.com/api/v1` |

Admin routes: `/api/v1/admin/*` — session cookie `print3d_admin_session` (`credentials: include`).

---

## Public catalog (`/api/v1`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | API uptime and timestamp |
| `GET` | `/categories` | Active categories (bilingual) |
| `GET` | `/products` | Paginated product list + filters |
| `GET` | `/products/:slug` | Product detail by slug |
| `POST` | `/orders/capture` | WhatsApp order capture |

Details: [contract.md](contract.md).

---

## Admin panel API (`/api/v1/admin`)

All routes below require authentication except `POST /auth/login`.

### Authentication

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| `POST` | `/auth/login` | Email + password → session cookie | 200 |
| `POST` | `/auth/logout` | Revoke session + clear cookie | 204 |
| `GET` | `/auth/me` | Current admin profile | 200 |
| `POST` | `/auth/refresh` | Extend sliding idle TTL (SPA timer) | 200 |

`POST /auth/refresh` and `GET /auth/me` are excluded from the global rate limit. Login: 5 req/min/IP.

The admin SPA calls `/auth/refresh` every 15 minutes and on navigation; `requireAdmin` also extends the idle window on each authenticated request.

### Products

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| `GET` | `/products` | Paginated list (all statuses, search) | 200 |
| `GET` | `/products/:id` | Product detail | 200 |
| `POST` | `/products` | Create bilingual product | 201 |
| `PATCH` | `/products/:id` | Update product | 200 |
| `DELETE` | `/products/:id` | Delete (blocked if orders reference) | 204 |

### Categories

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| `GET` | `/categories` | All categories (incl. inactive) | 200 |
| `GET` | `/categories/:id` | Category detail | 200 |
| `POST` | `/categories` | Create category | 201 |
| `PATCH` | `/categories/:id` | Update category | 200 |
| `DELETE` | `/categories/:id` | Soft-delete / deactivate | 204 |

### Orders (read-only)

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| `GET` | `/orders` | Paginated captures (`from`, `to`, `page`, `limit`) | 200 |
| `GET` | `/orders/:id` | Order detail + line items | 200 |

### Uploads

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| `POST` | `/uploads` | Multipart asset upload | 201 |

**Multipart fields** (order-independent on server; client sends `kind` before `file`):

| Field | Required | Values |
|-------|----------|--------|
| `kind` | Yes | `thumbnail` \| `gallery` \| `model` |
| `file` | Yes | WebP, JPEG, PNG (images) or `.glb`/`.gltf` (models) |

Images are stored as WebP. See [admin-contract.md](admin-contract.md#uploads).

---

## Errors

RFC 7807 `application/problem+json`. Localized via `Accept-Language: en` or `pt-BR`.

Upload-specific `detail` keys: `uploadMimeNotAllowed`, `uploadTooLarge`, `uploadInvalidImage`, `uploadStorageFailed`.

---

## Related

- [swagger.md](swagger.md) — Swagger UI setup
- [admin-contract.md](admin-contract.md) — full request/response examples
- [features/admin-panel.md](../features/admin-panel.md) — SPA routes map
