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
| `MODEL_FILES_BASE_PATH` | `/var/www/print3d/models` | path |
| `MODEL_FILES_BASE_URL` | `https://yourdomain.com/models` | URL |

## Startup validation

**File:** `apps/api/src/config.ts`

Use Zod `envSchema.parse(process.env)` — app MUST crash at startup with clear error if invalid.

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
