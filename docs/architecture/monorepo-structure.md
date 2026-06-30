# Monorepo Structure

## Target layout

```
open-3d-store-free-to-use/          # repo root (rename from print3d-shop in original spec)
├── apps/
│   ├── web/                        # React frontend + i18next (en, pt-BR)
│   │   ├── src/
│   │   │   └── i18n/locales/       # en.json, pt-BR.json
│   │   ├── public/
│   │   └── package.json
│   ├── admin/                      # Admin SPA (React 19, TanStack Router)
│   │   ├── src/
│   │   └── package.json
│   └── api/                        # Fastify backend
│       ├── src/
│       │   └── i18n/messages/      # API error strings (en, pt-BR)
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
├── playwright.config.ts            # E2E (Phase 7+)
├── e2e/                            # Playwright specs
└── package.json
```

## Current layout (Phase 1+)

```
apps/web/               # @print3d/web — TanStack Start + i18next (en, pt-BR)
apps/admin/             # @print3d/admin — Admin SPA (TanStack Router, port 5174)
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
| `lint` | `^build` | — |

## CI build artifacts

Workspace packages (`@print3d/shared-types`, `@print3d/whatsapp`, `@print3d/cep`) expose `dist/**` via `package.json` `exports`. Turbo `lint` and `test` depend on `^build`, so a fresh checkout must emit those folders on CI.

- **Never commit** `*.tsbuildinfo` or `dist/` — both are gitignored. A stale tracked `tsconfig.tsbuildinfo` can make `tsc` skip emitting `dist/` on CI while Turbo marks the build task complete.

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
