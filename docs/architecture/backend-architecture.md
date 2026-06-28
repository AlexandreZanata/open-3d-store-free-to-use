# Backend Architecture

## Layer diagram

```
HTTP Layer (Fastify routes + plugins)
        ↓
Application Layer (use cases)
        ↓
Domain Layer (entities, VOs, interfaces — pure, no I/O)
        ↓
Infrastructure Layer (Drizzle, Redis, file storage)
```

**Rule:** Inner layers NEVER depend on outer layers. See `agent-rules/AGENT-CORE-PRINCIPLES.md`.

## Directory structure — `apps/api/src/`

```
src/
├── config.ts              Zod env validation (crash on invalid)
├── container.ts           DI wiring: repos → cache → use cases
├── container/
│   └── adminUseCases.ts   Admin use case factory (Phase 11)
├── main.ts                Entry point (listen 127.0.0.1:PORT)
├── i18n/
│   ├── resolve-locale.ts  Accept-Language / ?locale= → SupportedLocale
│   └── messages/          en.json, pt-BR.json (RFC 7807 titles)
├── domain/
│   ├── entities/          Product.ts, Category.ts, AdminUser.ts
│   ├── value-objects/     Price.ts, Slug.ts, Locale.ts
│   ├── errors/            DomainError.ts
│   ├── repositories/      IProductRepository.ts, ICategoryRepository.ts, IOrderCaptureRepository.ts, IAdminUserRepository.ts, IAdminSessionRepository.ts, IAuditLogRepository.ts
│   └── services/          ProductStatusMachine.ts
├── application/
│   ├── use-cases/         GetProductBySlug, ListProducts, SearchProducts, GetCategories, CaptureOrder, admin/*
│   ├── dtos/              ProductResponseDto, CaptureOrderDto, Admin*Dto
│   ├── ports/             ICacheService.ts, IEventPublisher.ts, IPasswordHasher.ts, IAssetStorage.ts
│   ├── services/          AuditLogger.ts, CatalogCacheInvalidator.ts, sessionToken.ts
│   ├── validation/        adminCatalogValidation.ts
│   ├── cache/             cacheKeys.ts (TTL + locale-aware keys)
│   └── errors/            ApplicationErrors.ts
├── infrastructure/
│   ├── db/                schema.ts, client.ts, migrations/
│   ├── repositories/      Drizzle*Repository.ts, mappers/, product*Persistence.ts
│   ├── cache/             CacheService.ts, redis.ts (implements application ports)
│   ├── auth/              Argon2PasswordHasher.ts
│   └── storage/           LocalFileStorage.ts (catalog reads + admin uploads)
└── http/
    ├── server.ts          Fastify factory + error handler
    ├── errors/            problemDetails.ts (RFC 7807)
    ├── types/             fastify.d.ts (request.locale, cacheMaxAge)
    ├── plugins/           cors.ts, rate-limit.ts, cache-headers.ts, locale.ts
    └── routes/            health, products, categories, orders, admin/*
```

## HTTP layer (Phase 6)

| Route | Handler | Notes |
|-------|---------|-------|
| `GET /api/v1/health` | `health.routes.ts` | No cache |
| `GET /api/v1/categories` | `categories.routes.ts` | Cache 300s |
| `GET /api/v1/products` | `products.routes.ts` | List/search; cache 120s / 60s |
| `GET /api/v1/products/:slug` | `products.routes.ts` | Cache 600s; RFC 7807 404 |
| `POST /api/v1/orders/capture` | `orders.routes.ts` | Zod body; 201; rate limit 10/min |

Plugins: CORS (`CORS_ORIGIN`), Redis-backed rate limit (100/min global; 10/min on capture), `Cache-Control` per route, locale resolution.

Integration tests: `apps/api/tests/integration/routes/` (`app.inject()` — no real port).

## Admin HTTP layer (Phase 12)

| Prefix | Auth | Notes |
|--------|------|-------|
| `/api/v1/admin/auth/*` | Cookie session (`print3d_admin_session`) | Login rate limit 5/min; `requireAdmin` on protected routes |
| `/api/v1/admin/products` | Yes | CRUD + bilingual payloads |
| `/api/v1/admin/categories` | Yes | CRUD; soft-delete via `DELETE` |
| `/api/v1/admin/orders` | Yes | Read-only list + detail |
| `/api/v1/admin/uploads` | Yes | Multipart (`file` + `kind`) |

Plugins: `admin-auth.ts` (cookie + `requireAdmin`), CORS allows `ADMIN_ORIGIN` with credentials. Errors: RFC 7807 via `handleAdminError.ts`. Contract: [../api/admin-contract.md](../api/admin-contract.md).

Admin panel (Phase 13–15): `apps/admin` — TanStack Router SPA on port 5174. See [../features/admin-panel.md](../features/admin-panel.md).

## Database tables

| Table | Purpose |
|-------|---------|
| `categories` | Category aggregate |
| `products` | Product aggregate + locale-specific `search_vector_en` / `search_vector_pt` |
| `order_captures` | Analytics persistence |
| `domain_events` | Event log |
| `admin_users` | Admin credentials (argon2id hash) |
| `admin_sessions` | Server-side session store |
| `audit_logs` | Admin mutation audit trail |

Admin write repositories (Phase 10): `DrizzleAdminUserRepository`, `DrizzleAdminSessionRepository`, `DrizzleAuditLogRepository`; catalog admin CRUD on existing product/category repos. Contract: [../api/admin-contract.md](../api/admin-contract.md).

Admin use cases (Phase 11, wired on `container.admin`): `LoginAdmin`, `LogoutAdmin`, `GetCurrentAdmin`, product/category CRUD, `ListOrderCaptures`, `GetOrderCapture`, `UploadAsset`. Mutations call `AuditLogger`; catalog writes invalidate Redis via `CatalogCacheInvalidator` (`deleteByPrefix` on product/search keys + category key per locale). HTTP routes in Phase 12.

Full Drizzle schema: see spec in phase 2 — `apps/api/src/infrastructure/db/schema.ts`

## Full-text search

Per-locale PostgreSQL `to_tsvector` on resolved translation fields:

| Column | Config | Fields |
|--------|--------|--------|
| `search_vector_en` | `english` | en.name, en.shortDescription, material |
| `search_vector_pt` | `portuguese` | pt-BR name, shortDescription, material |

GIN index on each column. Phase 4 migration replaces single `search_vector` from Phase 2.

> Implemented as **BEFORE INSERT/UPDATE triggers** (not generated columns) because `to_tsvector` with language configs is not immutable in PostgreSQL.

> Search query uses the request locale's vector. See [../features/i18n.md](../features/i18n.md).

Migration: `apps/api/src/infrastructure/db/migrations/0003_i18n_search_vectors.sql` (Phase 4)

## Use cases (summary)

| Use case | Cache TTL | Doc reference |
|----------|-----------|---------------|
| `GetProductBySlug` | 600s | Phase 5 |
| `ListProducts` | 120s | Phase 5 |
| `SearchProducts` | 60s | Phase 5 |
| `GetCategories` | 300s | Phase 5 |
| `CaptureOrder` | none (write) | [../features/whatsapp-flow.md](../features/whatsapp-flow.md) |
| Admin catalog/auth | invalidate on write | Phase 11 — [../api/admin-contract.md](../api/admin-contract.md) |

## Repository interfaces

`IProductRepository`: `findBySlug`, `findById`, `findMany`, `search`, `findByIds` — all accept `SupportedLocale` for translated catalog fields.

`ICategoryRepository`: `findAllActive`, `findBySlug` — locale-aware.

`IOrderCaptureRepository`: `save(orderCapture, totalCents)`.

`ICacheService`: `get`, `set`, `del`, `deleteByPrefix`, `flush` — port in `application/ports/`; Redis via `CacheService`.

Pagination: `{ page, limit }` — max limit 50, 1-indexed pages.

## Harness rules

```bash
./agent-harness/resolve-rules.sh domain layer dependency injection repository
```

- `agent-rules/02-architecture/dependency-injection.md`
- `agent-rules/02-architecture/coupling-and-cohesion.md`
- `agent-rules/07-data-management/data-validation-at-boundary.md`

## Related documents

- [domain-model.md](domain-model.md)
- [../api/contract.md](../api/contract.md)
- [../operations/performance-caching.md](../operations/performance-caching.md)
