# Admin Panel

> Standalone SPA at `apps/admin` — React 19, TanStack Router, Tailwind v4.  
> API contract: [../api/admin-contract.md](../api/admin-contract.md) · Route index: [../api/axis-print3d-store-api.md](../api/axis-print3d-store-api.md)

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
| Layout | 240px sidebar (desktop); slide-out drawer + compact header (mobile) |

Tokens: `apps/admin/src/styles/admin-theme.css`, `apps/admin/src/lib/admin-tokens.ts`.

## Mobile layout

| Viewport | Navigation | Tables / forms |
|----------|------------|----------------|
| `< md` (768px) | Hamburger opens left drawer (`AdminNavLinks`); closes on route change | Horizontal scroll on tables; stacked form grids |
| `≥ md` | Fixed 240px sidebar | Multi-column grids where defined |

Touch targets: header menu and nav links use min 40px height. Main content respects `safe-area-inset-bottom` on notched devices.

List pages (e.g. products) use a bordered filter toolbar: labeled `Input` / `Select` fields in a responsive grid with the action button bottom-aligned on desktop (`xl:items-end`).

## Data tables

All list pages share `DataTable` (`apps/admin/src/components/ui/DataTable.tsx`):

| Feature | Behavior |
|---------|----------|
| Rows | White base (`bg-surface`) with zebra striping (`even` rows use `bg-surface-muted/60`) |
| Header | `bg-surface-muted` on white card |
| Pagination | Built-in footer when API returns `pagination` meta (products, orders); Previous/Next + summary text |
| Compact | `density="compact"` for nested tables (order line items) |

Pagination helpers: `apps/admin/src/lib/tablePagination.ts`.

Pages using `DataTable`: products (`ProductsTable` wrapper), categories, orders list, order detail line items.

## Media uploads

Product and category forms support **URL text** or **file upload** (`FileUploadField`):

| Input | Accepted in file picker | Stored |
|-------|-------------------------|--------|
| Thumbnail / gallery | WebP, JPEG, PNG (also `image/jpg` / `application/octet-stream` with valid image bytes) | WebP under `/models/thumbnails/` or `/models/images/` |
| 3D model | `.glb`, `.gltf` | unchanged under `/models/3d/` |

After upload or when a URL is set, a **128×128 preview box** (`data-testid="upload-preview-{kind}"`) shows the image. The admin resolves paths with `VITE_ASSETS_BASE_URL` (same host as the API in dev). The API serves files from `MODEL_FILES_BASE_PATH` at `GET /models/*` (development and test); production may use nginx for the same paths — see [../infrastructure/nginx.md](../infrastructure/nginx.md).

Edit and create pages use **`PageBackLink`** (primary black button) on the **right** of the page title via `PageHeader` `back` slot.

E2E: `e2e/admin-mobile.spec.ts` (Pixel 5 viewport, requires `admin-setup`).

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
| `/orders` | Order captures (last 30 days); list query uses a stable start-of-day `from` filter so React Query does not refetch forever |
| `/orders/:id` | Order detail (read-only) |
| `/settings` | Read-only shop/API info |

## Development

```bash
cp apps/admin/.env.example apps/admin/.env
pnpm dev:admin   # http://localhost:5174
```

`ADMIN_ORIGIN` in `apps/api/.env` must match the admin dev URL.

## Session recovery

The admin SPA keeps a sliding session via `POST /auth/refresh` every 15 minutes while the user is signed in. Any API call that returns **401** (including file uploads) also triggers a single refresh attempt and retries the request. If refresh fails, the user is signed out and redirected to `/login` instead of showing a stale “logged in” shell with auth errors.

Implementation: `apps/admin/src/lib/api/adminSessionCoordinator.ts`, `AdminAuthProvider`, and `adminRequest` in `apps/admin/src/lib/api/client.ts`.

Bootstrap admin (valid email required):

```bash
ADMIN_BOOTSTRAP_EMAIL=admin@test.local ADMIN_BOOTSTRAP_PASSWORD=test-password-12 \
  pnpm --filter @print3d/api db:seed
```

## Testing

| Layer | Location |
|-------|----------|
| Unit | `apps/admin/tests/unit/` |
| E2E | `e2e/admin-auth.spec.ts`, `e2e/admin-orders.spec.ts`, `e2e/admin-product-crud.spec.ts`, `e2e/admin-mobile.spec.ts` |

Unit: `apps/admin/tests/unit/admin-session-recovery.test.ts` (401 → refresh → retry / logout).

```bash
pnpm --filter @print3d/admin test
ADMIN_BASE_URL=http://localhost:5174 pnpm exec playwright test e2e/admin-auth.spec.ts
```

## Related

- [../architecture/monorepo-structure.md](../architecture/monorepo-structure.md)
- [../operations/commands-reference.md](../operations/commands-reference.md)
- [../adr/001-admin-authentication.md](../adr/001-admin-authentication.md)
