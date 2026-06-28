# Monorepo Structure

## Target layout

```
open-3d-store-free-to-use/          # repo root (rename from print3d-shop in original spec)
├── apps/
│   ├── web/                        # React frontend (migrate from current src/)
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── api/                        # Fastify backend (to be built)
│       ├── src/
│       ├── tests/
│       └── package.json
├── packages/
│   ├── shared-types/               # @print3d/shared-types
│   ├── whatsapp/                   # @print3d/whatsapp
│   └── cep/                        # @print3d/cep
├── infra/
│   ├── nginx/nginx.conf
│   ├── docker-compose.dev.yml
│   ├── pm2.ecosystem.config.js
│   └── scripts/deploy.sh, migrate.sh
├── docs/                           # Enterprise documentation (this folder)
├── .local/                         # Execution phases (gitignored)
├── agent-rules/                    # Harness rules (symlink)
├── agent-harness/                  # Harness scripts (symlink)
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── package.json
```

## Current layout (Phase 1+)

```
apps/web/               # @print3d/web — TanStack Start frontend
apps/api/               # @print3d/api — Drizzle schema, migrations (Phase 2+)
packages/shared-types/  # @print3d/shared-types — domain DTOs
packages/whatsapp/      # @print3d/whatsapp — wa.me link builder
packages/cep/           # @print3d/cep — CEP validate + IBGE lookup
infra/                  # docker-compose, nginx, pm2, scripts
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
package.json            # root — turbo scripts only
docs/
.agent-harness/
```

## Previous layout (before Phase 0)

```
src/                    # TanStack Start app at root — moved to apps/web/
vite.config.ts
package.json
docs/
.agent-harness/
```

## pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## turbo.json tasks

| Task | dependsOn | outputs |
|------|-----------|---------|
| `build` | `^build` | `dist/**` |
| `test` | `^build` | — (cache: false) |
| `dev` | — | persistent, no cache |
| `lint` | — | — |

## tsconfig.base.json highlights

- `target`: ES2022
- `module`: NodeNext
- `strict`: true
- `exactOptionalPropertyTypes`: true
- `noUncheckedIndexedAccess`: true

## Package naming

All internal packages: `@print3d/` scope.

## Migration note (Phase 0)

When moving `src/` → `apps/web/src/`:

1. Update `vite.config.ts` paths in `apps/web/`
2. Update root scripts to delegate via Turborepo
3. Keep harness files at repo root (`AGENTS.md`, `.cursor/`, `agent-*`)

## Related documents

- [../stack/technology-decisions.md](../stack/technology-decisions.md)
- `../../.local/phases/00-repository-scaffold.md`
- [../INDEX.md](../INDEX.md)
