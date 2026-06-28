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

Default dev credentials: `admin@localhost` / `change-me-in-dev`.

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
