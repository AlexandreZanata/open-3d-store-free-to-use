# Swagger / OpenAPI

Interactive API documentation for **v1** endpoints. The spec mirrors [contract.md](contract.md).

## Local access

With the API running in development:

| Resource | URL |
|----------|-----|
| **Swagger UI** | [http://127.0.0.1:3001/docs](http://127.0.0.1:3001/docs) |
| **OpenAPI JSON** | [http://127.0.0.1:3001/docs/json](http://127.0.0.1:3001/docs/json) |
| **OpenAPI YAML** | [http://127.0.0.1:3001/docs/yaml](http://127.0.0.1:3001/docs/yaml) |

Swagger UI is **disabled in production** (`NODE_ENV=production`). Use the contract doc or export the spec from a dev/staging environment.

## Start the API

```bash
# 1. Infrastructure (Postgres + Redis)
docker compose -f infra/docker-compose.dev.yml up -d

# 2. Migrations + seed (first time)
pnpm --filter @print3d/api db:migrate
pnpm --filter @print3d/api db:seed

# 3. API server
cp apps/api/.env.example apps/api/.env   # if needed
pnpm --filter @print3d/api dev
```

Open [http://127.0.0.1:3001/docs](http://127.0.0.1:3001/docs).

## Documented endpoints

| Method | Path | Success | Error responses |
|--------|------|---------|-----------------|
| `GET` | `/health` | 200 | 500 |
| `GET` | `/categories` | 200 | 429, 500 |
| `GET` | `/products` | 200 | 422, 429, 500 |
| `GET` | `/products/:slug` | 200 | 404, 429, 500 |
| `POST` | `/orders/capture` | 201 | 404, 422, 429, 500 |

All error responses use **RFC 7807** (`application/problem+json`).

### `422` variants on `POST /orders/capture`

| Case | `type` suffix |
|------|----------------|
| Invalid JSON body / Zod validation | `validation-failed` |
| Product out of stock or discontinued | `not-orderable` |
| Missing required product option | `validation-failed` |

## Source of truth

| Layer | Location |
|-------|----------|
| Human contract | `docs/api/contract.md` |
| OpenAPI schemas | `apps/api/src/http/openapi/` |
| Route wiring | `apps/api/src/http/routes/*.routes.ts` |

When adding endpoints, update **contract.md**, **route schemas**, and **contract tests** together.

## i18n in Swagger

Send `Accept-Language: en` or `Accept-Language: pt-BR`, or `?locale=en|pt-BR`. Error `title` and `detail` are localized; examples in Swagger show English.

## Related

- [contract.md](contract.md)
- [../operations/commands-reference.md](../operations/commands-reference.md)
- [../testing/contract-first-testing.md](../testing/contract-first-testing.md)
