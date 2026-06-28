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
│   ├── value-objects/     Price.ts, Slug.ts
│   ├── repositories/      IProductRepository.ts, ICategoryRepository.ts, IOrderCaptureRepository.ts
│   └── events/            DomainEvent.ts
├── application/
│   ├── use-cases/         GetProductBySlug, ListProducts, SearchProducts, GetCategories, CaptureOrder
│   └── dtos/              ProductResponseDto, CaptureOrderDto
├── infrastructure/
│   ├── db/                schema.ts, client.ts, migrations/
│   ├── repositories/      Drizzle*Repository.ts
│   ├── cache/             redis.ts, CacheService.ts, ICacheService.ts
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
| `products` | Product aggregate + `search_vector` tsvector |
| `order_captures` | Analytics persistence |
| `domain_events` | Event log |

Full Drizzle schema: see spec in phase 2 — `apps/api/src/infrastructure/db/schema.ts`

## Full-text search

PostgreSQL `to_tsvector('portuguese', ...)` on name, short_description, material. GIN index on `search_vector`.

> User-facing UI is English; search config uses Portuguese for Brazilian product content.

Migration: `apps/api/src/infrastructure/db/migrations/0002_add_search_vector.sql`

## Use cases (summary)

| Use case | Cache TTL | Doc reference |
|----------|-----------|---------------|
| `GetProductBySlug` | 600s | Phase 5 |
| `ListProducts` | 120s | Phase 5 |
| `SearchProducts` | 60s | Phase 5 |
| `GetCategories` | 300s | Phase 5 |
| `CaptureOrder` | none (write) | [../features/whatsapp-flow.md](../features/whatsapp-flow.md) |

## Repository interfaces

`IProductRepository`: `findBySlug`, `findById`, `findMany`, `search`, `findByIds`

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
