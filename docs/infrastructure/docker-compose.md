# Docker Compose (Local Dev + Production Data)

**Dev file:** `infra/docker-compose.dev.yml`  
**Prod data layer:** `infra/docker-compose.prod.yml` (VPS only — Postgres, Redis, RabbitMQ on `127.0.0.1`)

## Local dev services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| postgres | postgres:18.4-alpine | 5432 | Dev database `print3d_dev` |
| redis | redis:8.8-alpine | 6379 | Cache + rate limit |
| rabbitmq | rabbitmq:3.13-management-alpine | 5672, 15672 | Model processing queue (management UI on 15672) |

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

RabbitMQ (model upload queue) — set in `apps/api/.env`:

```
RABBITMQ_URL=amqp://guest:localdev123@127.0.0.1:5672
MODEL_PROCESSING_QUEUE=model.processing
```

Management UI: http://127.0.0.1:15672 (user `guest`, password `localdev123`).

Optional worker (async processing for large models):

```bash
pnpm --filter @print3d/api worker:model-processing
```

## Test database

Separate DB for Vitest: `print3d_test` — created on first Postgres init via `infra/postgres/init-test-db.sql`. Configure via `TEST_DATABASE_URL` in `.env.test`.

> **PostgreSQL 18 Docker volume:** mount at `/var/lib/postgresql` (not `/data`) — see [postgres#1259](https://github.com/docker-library/postgres/pull/1259).

## Production data layer (VPS)

Efficient default on 16 GB Hostinger: **PM2 for Node**, **Docker Compose for data** (bind localhost only).

```bash
cp production/env/docker.env.example production/env/docker.env
# fill POSTGRES_PASSWORD and RABBITMQ_PASSWORD (generate-secrets.sh does this)
docker compose -f infra/docker-compose.prod.yml --env-file production/env/docker.env up -d
```

| Service | Memory limit | Port |
|---------|--------------|------|
| postgres:18.4-alpine | 4 GB | 127.0.0.1:5432 |
| redis:8.8-alpine | 512 MB | 127.0.0.1:6379 |
| rabbitmq:3.13-management | 512 MB | 127.0.0.1:5672 |

Alternative: native `postgresql-18` + `redis-server` via `bootstrap-vps.sh` with `USE_DOCKER_DATA=0`.

Kubernetes is **not** used on a single VPS — see [kubernetes.md](kubernetes.md).

## Related documents

- [environment.md](environment.md)
- `.local/phases/02-database-setup.md`
