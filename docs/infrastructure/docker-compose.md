# Docker Compose (Local Dev)

**File:** `infra/docker-compose.dev.yml`

## Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| postgres | postgres:18.4-alpine | 5432 | Dev database `print3d_dev` |
| redis | redis:8.8-alpine | 6379 | Cache + rate limit |

## Start

```bash
docker compose -f infra/docker-compose.dev.yml up -d
```

## Credentials (dev only)

```
POSTGRES_DB=print3d_dev
POSTGRES_USER=print3d
POSTGRES_PASSWORD=devpassword
```

**Never use dev credentials in production.**

## Test database

Separate DB for Vitest: `print3d_test` — configure via `TEST_DATABASE_URL` in `.env.test`.

## Related documents

- [environment.md](environment.md)
- `.local/phases/02-database-setup.md`
