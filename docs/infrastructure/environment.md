# Environment Configuration

## Files

| File | Purpose | In git? |
|------|---------|---------|
| `apps/api/.env.example` | Template | Yes |
| `apps/api/.env` | Local dev secrets | No |
| `apps/api/.env.test` | Test runner | No |
| Production `.env` on VPS | Prod secrets | No |

## Required variables

| Variable | Example | Validation |
|----------|---------|------------|
| `NODE_ENV` | `development` | enum |
| `PORT` | `3001` | 1024–65535 |
| `DATABASE_URL` | `postgresql://...` | URL |
| `TEST_DATABASE_URL` | `postgresql://...` | URL (test only) |
| `REDIS_URL` | `redis://localhost:6379` | URL |
| `WHATSAPP_PHONE_NUMBER` | `5565999999999` or `(65) 99999-9999` | `@br-validators/core/telefone` via `@print3d/whatsapp` |
| `CORS_ORIGIN` | `http://localhost:5173` | URL |
| `MODEL_FILES_BASE_PATH` | `storage/models` (dev) or `/var/www/print3d/models` (prod) | path |
| `MODEL_FILES_BASE_URL` | `https://yourdomain.com/models` | URL |

## Admin variables (Phase 9+)

| Variable | Example | Validation | Notes |
|----------|---------|------------|-------|
| `ADMIN_SESSION_SECRET` | random 32+ bytes | min 32 chars | Signs session cookie |
| `ADMIN_SESSION_TTL` | `28800` | integer seconds | Default 8 h (ADR 001) |
| `ADMIN_SESSION_IDLE_TTL` | `1800` | integer seconds | Default 30 min idle |
| `ADMIN_ORIGIN` | `http://localhost:5174` | URL | Admin panel CORS origin |
| `ADMIN_BOOTSTRAP_EMAIL` | `admin@localhost` | email | **Development only** |
| `ADMIN_BOOTSTRAP_PASSWORD` | `change-me` | min 8 chars | **Development only** |
| `UPLOAD_MAX_BYTES` | `5242880` | integer | Global cap; per-kind limits in admin contract |
| `UPLOAD_DIR` | `/var/www/print3d/models` | path | Same tree as `MODEL_FILES_BASE_PATH` |

Added to `apps/api/.env.example` as placeholders. Production MUST set `ADMIN_SESSION_SECRET` and MUST NOT set bootstrap vars.

Admin contract: [../api/admin-contract.md](../api/admin-contract.md)

## Startup validation

**File:** `apps/api/src/config.ts`

Use Zod `envSchema.parse(process.env)` — app MUST crash at startup with clear error if invalid.

In **development**, if `MODEL_FILES_BASE_PATH` is not writable (common when set to `/var/www/...`), the API automatically falls back to `apps/api/storage/models`.

The API also serves that directory at **`GET /models/*`** (no auth) so admin and storefront previews work without nginx in local dev. Set `VITE_ASSETS_BASE_URL` to the API origin (e.g. `http://127.0.0.1:3001`).

Harness: `agent-rules/03-security/secrets-and-credentials.md`

## Frontend env (TanStack / Vite)

| File | Purpose | In git? |
|------|---------|---------|
| `apps/web/.env.example` | Local dev API URL | Yes |
| `apps/web/.env.production.example` | VPS build-time URLs | Yes |
| `apps/web/.env.production` | Production build on VPS | No |

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | REST client base (includes `/api/v1`) |
| `VITE_ASSETS_BASE_URL` | Public origin for model thumbnails and `.glb` paths |

Production deploy reads these at **build time**. `deploy.sh` derives them from `CORS_ORIGIN` when `.env.production` is missing.

## Related documents

- [docker-compose.md](docker-compose.md)
- [deployment.md](deployment.md)
- `.local/phases/06-http-layer.md` — task: create `config.ts`
