# Admin Panel

> Standalone SPA at `apps/admin` — React 19, TanStack Router, Tailwind v4.  
> API contract: [../api/admin-contract.md](../api/admin-contract.md)

## Purpose

Internal catalog and order management for the AXIS storefront. MVP scope: bilingual product/category CRUD, read-only orders, session auth, file uploads.

## Design principles

| Element | Treatment |
|---------|-------------|
| Background | White / off-white |
| Text | Near-black |
| Primary action | Solid black button |
| Destructive | Red outline/text on confirm only |
| Status badges | Text label + colored dot (not color-only) |
| Layout | 240px sidebar, flat surfaces, hairline borders |

Tokens: `apps/admin/src/styles/admin-theme.css`, `apps/admin/src/lib/admin-tokens.ts`.

## Routes

| Path | Page |
|------|------|
| `/login` | Public sign-in |
| `/` | Dashboard stats |
| `/products` | Product list |
| `/products/new` | Create product |
| `/products/:id` | Edit product |
| `/categories` | Category list |
| `/categories/new` | Create category |
| `/categories/:id` | Edit category |
| `/orders` | Order captures (last 30 days) |
| `/orders/:id` | Order detail (read-only) |
| `/settings` | Read-only shop/API info |

## Development

```bash
cp apps/admin/.env.example apps/admin/.env
pnpm dev:admin   # http://localhost:5174
```

`ADMIN_ORIGIN` in `apps/api/.env` must match the admin dev URL.

Bootstrap admin (valid email required):

```bash
ADMIN_BOOTSTRAP_EMAIL=admin@test.local ADMIN_BOOTSTRAP_PASSWORD=test-password-12 \
  pnpm --filter @print3d/api db:seed
```

## Testing

| Layer | Location |
|-------|----------|
| Unit | `apps/admin/tests/unit/` |
| E2E | `e2e/admin-auth.spec.ts`, `e2e/admin-product-crud.spec.ts` |

```bash
pnpm --filter @print3d/admin test
ADMIN_BASE_URL=http://localhost:5174 pnpm exec playwright test e2e/admin-auth.spec.ts
```

## Related

- [../architecture/monorepo-structure.md](../architecture/monorepo-structure.md)
- [../operations/commands-reference.md](../operations/commands-reference.md)
- [../adr/001-admin-authentication.md](../adr/001-admin-authentication.md)
