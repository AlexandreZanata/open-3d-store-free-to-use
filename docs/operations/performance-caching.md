# Performance & Caching

## Redis cache TTLs

| Resource | TTL | Invalidation |
|----------|-----|--------------|
| Category list | 300s | Admin update → manual flush |
| Product list (per filter) | 120s | TTL expiry |
| Product detail | 600s | Admin update |
| Search results | 60s | TTL expiry |

## Cache key pattern

**File:** `apps/api/src/infrastructure/cache/CacheService.ts`

```
v1:product:{slug}
v1:products:{filtersHash}
v1:categories
v1:search:{query}:{page}
```

Prefix `v1:` — bump on breaking cache shape changes.

## Static assets

| Asset | Cache |
|-------|-------|
| JS/CSS (hashed filenames) | 1 year immutable |
| `.glb` models | 30 days |

## Database rules

- **Never N+1** — JOIN or batch `findByIds`
- Run `EXPLAIN ANALYZE` on list queries during development
- Connection pool: max 10 per process × 2 PM2 workers = 20 total

## PostgreSQL tuning (4 GB allocation)

```ini
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 64MB
maintenance_work_mem = 256MB
max_connections = 50
random_page_cost = 1.1
```

## Rate limiting

| Endpoint class | Limit |
|----------------|-------|
| General API | 100 req/min/IP |
| Admin `/api/v1/admin/*` | 600 req/min/IP |
| POST /orders/capture | 10 req/min/IP |

**File:** `apps/api/src/http/plugins/rate-limit.ts`

Uses Redis-backed `@fastify/rate-limit`.

## Harness rules

- `agent-rules/05-performance-and-scalability/caching-strategy.md`
- `agent-rules/05-performance-and-scalability/query-efficiency.md`

## Related documents

- [../architecture/backend-architecture.md](../architecture/backend-architecture.md)
- [../infrastructure/deployment.md](../infrastructure/deployment.md)
