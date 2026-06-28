# ADR 002 — Admin API Namespace

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-06-28 |
| **Phase** | 9 — Admin spec & types |
| **Depends on** | [001-admin-authentication.md](001-admin-authentication.md) |

## Context

Public catalog lives at `/api/v1/*` without authentication. Admin operations need isolation — separate CORS origin, Swagger tagging, and URL prefix so guards and rate limits apply uniformly.

## Decision

### URL layout

| Surface | Prefix | Auth |
|---------|--------|------|
| Public storefront | `/api/v1/` | None |
| Admin panel API | `/api/v1/admin/` | Session cookie (ADR 001) |

Examples:

```
POST   /api/v1/admin/auth/login
GET    /api/v1/admin/products
POST   /api/v1/admin/uploads
```

Health check remains public: `GET /api/v1/health` (no admin prefix).

### CORS

| Variable | Purpose |
|----------|---------|
| `CORS_ORIGIN` | Storefront (`apps/web`) — existing |
| `ADMIN_ORIGIN` | Admin panel origin only — e.g. `http://localhost:5174` dev, `https://admin.yourdomain.com` prod |

Admin routes:

- `Access-Control-Allow-Origin`: `ADMIN_ORIGIN` only (never `*`)
- `Access-Control-Allow-Credentials`: `true`
- Allowed methods: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`
- Allowed headers: `Content-Type`, `Accept-Language`

Public routes keep existing `CORS_ORIGIN` behavior unchanged.

### Swagger / OpenAPI

| Tag | Routes | Visibility |
|-----|--------|------------|
| `catalog` | Public `/api/v1/*` | Dev `/docs` |
| `admin` | `/api/v1/admin/*` | Dev `/docs` only |

Production: Swagger UI disabled (`NODE_ENV=production`).

### Error format

Same RFC 7807 shape as [../api/contract.md](../api/contract.md). Admin errors include localized `title` / `detail` when `Accept-Language` is set.

### Rate limits

| Endpoint class | Limit |
|----------------|-------|
| `POST /admin/auth/login` | 5 req/min/IP |
| Other admin routes | 100 req/min/IP (authenticated session) |

## Consequences

- `@print3d/shared-types` admin DTOs map 1:1 to [../api/admin-contract.md](../api/admin-contract.md).
- Phase 12 registers admin routes under Fastify plugin prefix `/admin`.
- Admin frontend is a separate app or path — not bundled in storefront `apps/web` (Phase 13+).

## Related

- [001-admin-authentication.md](001-admin-authentication.md)
- [../api/admin-contract.md](../api/admin-contract.md)
- [../api/contract.md](../api/contract.md)
