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

### Public catalog

| Method | Path | Success | Error responses |
|--------|------|---------|-----------------|
| `GET` | `/health` | 200 | 500 |
| `GET` | `/categories` | 200 | 429, 500 |
| `GET` | `/products` | 200 | 422, 429, 500 |
| `GET` | `/products/:slug` | 200 | 404, 429, 500 |
| `GET` | `/catalog/events` | 200 (SSE) | — |
| `POST` | `/orders/capture` | 201 | 404, 422, 429, 500 |

### Admin (`/admin/*`, session cookie)

| Method | Path | Success | Error responses |
|--------|------|---------|-----------------|
| `POST` | `/admin/auth/login` | 200 | 401, 422, 429, 500 |
| `POST` | `/admin/auth/logout` | 204 | 401, 500 |
| `GET` | `/admin/auth/me` | 200 | 401, 500 |
| `POST` | `/admin/auth/refresh` | 200 | 401, 500 |
| `GET` | `/admin/products` | 200 | 401, 429, 500 |
| `GET` | `/admin/products/:id` | 200 | 401, 404, 500 |
| `POST` | `/admin/products` | 201 | 401, 409, 422, 500 |
| `PATCH` | `/admin/products/:id` | 200 | 401, 404, 409, 422, 500 |
| `DELETE` | `/admin/products/:id` | 204 | 401, 404, 409, 500 |
| `GET` | `/admin/categories` | 200 | 401, 500 |
| `POST` | `/admin/categories` | 201 | 401, 409, 422, 500 |
| `GET` | `/admin/categories/:id` | 200 | 401, 404, 500 |
| `PATCH` | `/admin/categories/:id` | 200 | 401, 404, 409, 422, 500 |
| `DELETE` | `/admin/categories/:id` | 204 | 401, 404, 409, 500 |
| `GET` | `/admin/orders` | 200 | 401, 500 |
| `GET` | `/admin/orders/:id` | 200 | 401, 404, 500 |
| `POST` | `/admin/uploads` | 201 | 400, 401, 422, 500 |

Multipart: `kind` (`thumbnail` \| `gallery` \| `model`) + `file`. Field order is independent on the server; the admin SPA sends `kind` before `file`.

Full route index: [axis-print3d-store-api.md](axis-print3d-store-api.md). Admin contract: [admin-contract.md](admin-contract.md).

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
