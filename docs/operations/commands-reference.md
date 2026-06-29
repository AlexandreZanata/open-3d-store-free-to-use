# Commands Reference

## Development

```bash
docker compose -f infra/docker-compose.dev.yml up -d   # Postgres 18.4 + Redis 8.8
pnpm dev                                                 # All apps (Turborepo watch)
pnpm dev:admin                                           # Admin panel only (port 5174)
pnpm --filter web dev                                    # Frontend only
pnpm --filter @print3d/admin dev                         # Admin panel (alias)
pnpm --filter @print3d/api dev                    # API + Swagger UI at /docs
curl http://127.0.0.1:3001/api/v1/health               # Smoke: { "status": "ok", ... }
```

### Storefront dev

Storefront SPA runs on **port 5173** (default) or a custom port. Copy `apps/web/.env.example` to `apps/web/.env` and set `VITE_API_BASE_URL` to your API. **Do not** set `VITE_ASSETS_BASE_URL` to the API host — omit it so thumbnails load as same-origin `/models/...` (Vite proxies to the API).

```bash
cp apps/web/.env.example apps/web/.env
# Custom port example:
pnpm --filter @print3d/web exec vite dev --host 127.0.0.1 --port 5176
```

`CORS_ORIGIN` in `apps/api/.env` must match the storefront browser URL when testing SSE ([../features/catalog-realtime.md](../features/catalog-realtime.md)).

### Admin API smoke (Phase 12)

Requires `pnpm --filter @print3d/api db:migrate`, seeded catalog, and bootstrap admin (`ADMIN_BOOTSTRAP_*` in `.env`).

```bash
# Login (stores cookie in /tmp/admin-cookie.txt)
curl -c /tmp/admin-cookie.txt -X POST http://127.0.0.1:3001/api/v1/admin/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@localhost","password":"change-me-in-dev"}'

# Current admin profile
curl -b /tmp/admin-cookie.txt http://127.0.0.1:3001/api/v1/admin/auth/me

# List products (all statuses)
curl -b /tmp/admin-cookie.txt 'http://127.0.0.1:3001/api/v1/admin/products?page=1&limit=20'
```

### Admin panel dev (Phase 13)

Admin SPA runs on **port 5174** (or custom port). `ADMIN_ORIGIN` in `apps/api/.env` must **exactly** match the browser URL (`http://localhost:5174` ≠ `http://127.0.0.1:5174`).

```bash
cp apps/admin/.env.example apps/admin/.env
# Custom port example (assets load same-origin; Vite proxies /models to the API):
export VITE_API_BASE_URL=http://127.0.0.1:3025/api/v1
pnpm --filter @print3d/admin exec vite --host 127.0.0.1 --port 5180
```

Load API env before `pnpm --filter @print3d/api dev` (`set -a && source apps/api/.env && set +a`). Restart API after rate-limit changes — old processes keep previous policy.

**429 Too Many Requests:** In development the global bucket is off; only `POST /auth/login` is limited (5/min per IP). If login is blocked, wait 1 min or `docker compose -f infra/docker-compose.dev.yml exec redis redis-cli FLUSHDB`.

```bash
# Credentials (valid email required)
ADMIN_BOOTSTRAP_EMAIL=admin@test.local
ADMIN_BOOTSTRAP_PASSWORD=test-password-12
```

### Admin catalog CRUD smoke (Phase 14)

With admin dev + API running, create a category and product in the UI, then verify the storefront:

```bash
curl -H 'Accept-Language: en' http://127.0.0.1:3001/api/v1/products/your-slug
curl -H 'Accept-Language: pt-BR' http://127.0.0.1:3001/api/v1/products/your-slug
```

### Admin orders & E2E (Phase 15)

```bash
pnpm --filter @print3d/admin test
source apps/api/.env
CI=true PLAYWRIGHT_API_PORT=3010 pnpm exec playwright test e2e/admin-auth.spec.ts --project=admin-chromium
CI=true PLAYWRIGHT_API_PORT=3010 pnpm exec playwright test e2e/admin-product-crud.spec.ts --project=admin-crud-chromium
CI=true PLAYWRIGHT_API_PORT=3010 pnpm exec playwright test e2e/admin-mobile.spec.ts --project=admin-mobile-chromium

# Orders list (requires admin session cookie)
curl -b /tmp/admin-cookie.txt 'http://127.0.0.1:3001/api/v1/admin/orders?page=1&limit=20'
```

## Database

```bash
pnpm --filter api drizzle-kit generate    # New migration SQL
pnpm --filter api drizzle-kit migrate     # Apply migrations
pnpm --filter api db:seed                   # Idempotent bilingual seed + thumbnail assets
pnpm --filter api tsx scripts/smokeUseCases.ts   # Manual use-case smoke (needs DATABASE_URL + REDIS_URL)
pnpm --filter api drizzle-kit studio      # Drizzle Studio GUI
```

## Testing

```bash
pnpm test                              # All unit + integration (Turbo)
pnpm --filter @print3d/api test        # API unit + integration
pnpm --filter @print3d/whatsapp test   # WhatsApp package
pnpm --filter @print3d/cep test        # CEP package
pnpm e2e                               # Playwright E2E (Phase 7+)
pnpm e2e:ui                            # Playwright UI mode (local debug)
```

**Mandatory before writing tests:** [../testing/README.md](../testing/README.md) → [../testing/contract-first-testing.md](../testing/contract-first-testing.md)

## Build

```bash
pnpm build                         # Turborepo — all packages
pnpm build:admin                   # Admin SPA production build
pnpm --filter api build            # API dist only
pnpm --filter web build            # Frontend production build
pnpm --filter @print3d/admin build # Admin SPA dist only
```

## Lint & format

```bash
pnpm lint                              # Typecheck + ESLint (no any / unknown)
pnpm typecheck                         # tsc --noEmit only (Turbo)
pnpm lint:eslint                       # ESLint strict type rules only
pnpm --filter web format               # Prettier
```

## Quality Gate (mandatory before commit)

Typecheck, ESLint, size/complexity, and tests are **paired gates** — see [code-quality-gates.md](code-quality-gates.md).

Git hooks (Husky) run automatically:

- **pre-commit:** ESLint on staged files + `pnpm quality:quick`
- **pre-push:** `pnpm quality` (typecheck, ESLint, size, tests)

Manual full gate:

```bash
pnpm quality                             # typecheck + ESLint + size + tests
./scripts/quality-gate.sh ci             # same + build (matches GitHub Actions)
pnpm turbo lint                          # Typecheck only
./agent-harness/verify-size-complexity.sh
pnpm turbo test
```

Caps: **≤80 lines/function**, **≤200 lines/file**, **cyclomatic ≤10** per function (harness universal rule).

## Production (VPS)

```bash
pm2 logs print3d-api
pm2 logs print3d-web
pm2 reload print3d-api             # Zero-downtime API
pm2 reload print3d-web
pm2 monit
./infra/scripts/migrate.sh         # Apply Drizzle migrations only
./infra/scripts/deploy.sh          # Full pull/build/migrate/reload
pnpm test:infra                    # Infra contract tests (Node test runner)
```

## Harness

```bash
./agent-harness/resolve-rules.sh <keywords>
./agent-harness/generate-task-rules.sh <keywords>
./agent-harness/generate-task-rules.sh --clean
./agent-harness/verify-size-complexity.sh   # File line cap (200) — run with typecheck
```

## Related documents

- [../INDEX.md](../INDEX.md)
- [code-quality-gates.md](code-quality-gates.md)
- [../testing/contract-first-testing.md](../testing/contract-first-testing.md)
- `.local/phases/`
