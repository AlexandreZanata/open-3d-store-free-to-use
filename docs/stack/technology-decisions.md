# Stack Decision & Rationale

> Every decision optimized for a single 16 GB VPS with a solo operator. No microservices. No Kubernetes.

## Selected stack

| Layer | Technology | Reason |
|-------|------------|--------|
| **Runtime** | Node.js 22 LTS (Fastify) | Same language as frontend, fast I/O, low memory per request |
| **Language** | TypeScript (strict) | End-to-end type safety; shared types via monorepo |
| **Frontend** | TanStack Start + React 19 | SSR, file-based routing (`apps/web/`) |
| **Styling** | Tailwind CSS 4 | Utility-first, small bundle |
| **Database** | PostgreSQL 18.4 | JSONB, full-text search, **native `uuidv7()`** — no app-side ID generation for DB defaults |
| **ORM** | Drizzle ORM | Zero-overhead, full TS inference, maps to PG `uuid` + `uuidv7()` |
| **Cache** | Redis 8.8 | Latest OSS release; HTTP cache, rate limiting, built-in window counter (INCREX) |
| **File storage** | Local filesystem + Nginx | `.glb` / images served by Nginx; no S3 cost |
| **3D viewer** | `@google/model-viewer` | Zero bundle cost; lazy-loaded; WebGL + AR |
| **Process manager** | PM2 | Zero-downtime reload, log rotation, clustering |
| **Reverse proxy** | Nginx | SSL, static files, gzip, cache headers |
| **Monorepo** | pnpm workspaces + Turborepo | Fast installs, build caching, shared packages |
| **BR phone validation** | `@br-validators/core/telefone` | Anatel DDD rules; validate + mask for WhatsApp (`@print3d/whatsapp`) |
| **Testing** | Vitest + Supertest | Native ESM, fast, Node 22 compatible |
| **Containerization** | Docker Compose (dev only) | `postgres:18.4-alpine`, `redis:8.8-alpine`; prod runs on VPS directly |

## PostgreSQL 18.4 — native UUIDv7

PostgreSQL 18 adds **`uuidv7()`** as a built-in function. Use it for time-ordered, index-friendly primary keys:

```sql
-- Column default (preferred for new tables)
id uuid PRIMARY KEY DEFAULT uuidv7()

-- Or explicit insert
INSERT INTO products (id, name, ...) VALUES (uuidv7(), '...', ...);
```

| Approach | When |
|----------|------|
| DB `DEFAULT uuidv7()` | New rows inserted via SQL/Drizzle |
| App `uuidv7` package | Order capture IDs before persist (WhatsApp link generation) |

Drizzle: use `uuid('id').primaryKey().default(sql\`uuidv7()\`)` — see `docs/architecture/backend-architecture.md`.

## Redis 8.8

Pin **`redis:8.8`** (or `redis:8.8-alpine` in Docker). Replaces Valkey 7 — same protocol, latest OSS feature set including improved rate-limit primitives (`INCREX`).

## Package scope

Internal packages use `@print3d/` scope:

- `@print3d/shared-types`
- `@print3d/whatsapp`

## Current frontend stack (already in repo)

| Package | Version | Location |
|---------|---------|----------|
| TanStack Start | ^1.168 | `apps/web/vite.config.ts`, `apps/web/src/start.ts` |
| TanStack Router | ^1.170 | `apps/web/src/routes/` |
| React Query | ^5.101 | `apps/web/src/routes/__root.tsx` |
| shadcn/ui + Radix | various | `apps/web/src/components/ui/` |
| Zod | ^3.24 | forms validation (future API client) |

## Related documents

- [rejected-options.md](rejected-options.md)
- [../architecture/monorepo-structure.md](../architecture/monorepo-structure.md)
- [../architecture/backend-architecture.md](../architecture/backend-architecture.md)
- [../testing/tdd-strategy.md](../testing/tdd-strategy.md)
