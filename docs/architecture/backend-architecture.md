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
├── domain/
│   ├── entities/          Product.ts, Category.ts
│   ├── value-objects/     Price.ts, Slug.ts, Locale.ts
│   ├── errors/            DomainError.ts
│   ├── repositories/      IProductRepository.ts, ICategoryRepository.ts, IOrderCaptureRepository.ts
│   └── events/            DomainEvent.ts
├── application/
│   ├── use-cases/         GetProductBySlug, ListProducts, SearchProducts, GetCategories, CaptureOrder
│   ├── dtos/              ProductResponseDto, CaptureOrderDto
│   ├── ports/             ICacheService.ts, IEventPublisher.ts
│   ├── cache/             cacheKeys.ts (TTL + locale-aware keys)
│   └── errors/            ApplicationErrors.ts
├── infrastructure/
│   ├── db/                schema.ts, client.ts, migrations/
│   ├── repositories/      Drizzle*Repository.ts, mappers/
│   ├── cache/             CacheService.ts, redis.ts (implements application ports)
│   └── storage/           LocalFileStorage.ts
└── http/
    ├── server.ts
    ├── plugins/           cors.ts, rate-limit.ts, cache-headers.ts
    └── routes/            health, products, categories, orders
```

## Database tables

| Table | Purpose |
|-------|---------|
| `categories` | Category aggregate |
| `products` | Product aggregate + locale-specific `search_vector_en` / `search_vector_pt` |
| `order_captures` | Analytics persistence |
| `domain_events` | Event log |

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

## Repository interfaces

`IProductRepository`: `findBySlug`, `findById`, `findMany`, `search`, `findByIds` — all accept `SupportedLocale` for translated catalog fields.

`ICategoryRepository`: `findAllActive`, `findBySlug` — locale-aware.

`IOrderCaptureRepository`: `save(orderCapture, totalCents)`.

`ICacheService`: `get`, `set`, `del`, `flush` — port in `application/ports/`; Redis via `CacheService`.

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
