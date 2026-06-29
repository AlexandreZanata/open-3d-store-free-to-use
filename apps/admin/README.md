# @print3d/admin

Standalone admin SPA for catalog and order management. React 19, TanStack Router, Tailwind v4.

## Development

```bash
cp .env.example .env
pnpm --filter @print3d/admin dev    # http://localhost:5174
```

Ensure the API allows this origin:

```bash
# apps/api/.env
ADMIN_ORIGIN=http://localhost:5174
```

Bootstrap admin (first run):

```bash
pnpm --filter @print3d/api db:migrate
pnpm --filter @print3d/api db:seed
# ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD in apps/api/.env
```

Default dev credentials: use a valid bootstrap email (e.g. `admin@test.local` after seed — `admin@localhost` fails API email validation).

## Catalog CRUD (Phase 14)

| Route | Purpose |
|-------|---------|
| `/products` | List, search, filter, delete |
| `/products/new` | Create bilingual product |
| `/products/:id` | Edit, save, delete |
| `/categories` | List, deactivate |
| `/categories/new` | Create bilingual category |
| `/categories/:id` | Edit category |
| `/calculator` | Bulk pre-price from material + machine rates |
| `/settings` | Shop profile, studio colors, material pricing |

**Model studio:** `kind=model` uploads accept STL/GLB up to 256 MB. Poll `GET /admin/model-jobs/:id` after upload. If RabbitMQ is misconfigured, the API processes the mesh inline (upload still succeeds). Optional worker:

```bash
# apps/api/.env — match your RabbitMQ credentials
RABBITMQ_URL=amqp://guest:guest@127.0.0.1:5672
pnpm --filter @print3d/api worker:model-processing
```

Features: React Query hooks, slug preview (`slugify.ts`), BRL price input → cents, file uploads (`FileUploadField`, `ModelUploadField`), product options editor, **pre-calculated price** on product form (print hours + grams + material).

## Design tokens

| Token | Usage |
|-------|--------|
| `--background` / `--foreground` | White / near-black base |
| `--hairline` | Hairline borders |
| `--primary` | Solid black primary actions |
| `--admin-accent` | Focus rings (oklch green) |
| `--destructive` | Delete confirm only |
| `--status-*` | Product `PrintStatus` badges |

Semantic class strings live in `src/lib/admin-tokens.ts`. Theme CSS: `src/styles/admin-theme.css`.

Rules: flat surfaces, no gradients, no heavy shadows.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Vite dev server (port 5174) |
| `pnpm build` | Production build to `dist/` |
| `pnpm lint` | Typecheck + ESLint |
| `pnpm test` | Vitest unit tests |

## Related docs

- [Admin API contract](../../docs/api/admin-contract.md)
- [Monorepo structure](../../docs/architecture/monorepo-structure.md)
- [Commands reference](../../docs/operations/commands-reference.md)
