# Commands Reference

## Development

```bash
docker compose -f infra/docker-compose.dev.yml up -d   # Postgres 18.4 + Redis 8.8
pnpm dev                                                 # All apps (Turborepo watch)
pnpm --filter web dev                                    # Frontend only
pnpm --filter api dev                                    # API only
```

## Database

```bash
pnpm --filter api drizzle-kit generate    # New migration SQL
pnpm --filter api drizzle-kit migrate     # Apply migrations
pnpm --filter api db:seed                   # Idempotent bilingual seed
pnpm --filter api drizzle-kit studio      # Drizzle Studio GUI
```

## Testing

```bash
pnpm test                              # All unit + integration (Turbo)
pnpm --filter @print3d/api test        # API unit + integration
pnpm --filter @print3d/whatsapp test   # WhatsApp package
pnpm --filter @print3d/cep test        # CEP package
pnpm e2e                               # Playwright E2E (Phase 7+)
pnpm e2e:ui                            # Playwright UI mode (local debug)
```

**Mandatory before writing tests:** [../testing/README.md](../testing/README.md) → [../testing/contract-first-testing.md](../testing/contract-first-testing.md)

## Build

```bash
pnpm build                         # Turborepo — all packages
pnpm --filter api build            # API dist only
pnpm --filter web build            # Frontend production build
```

## Lint & format

```bash
pnpm turbo lint
pnpm --filter web format           # Prettier
```

## Quality Gate (mandatory before commit)

Typecheck, size/complexity, and tests are **paired gates** — see [code-quality-gates.md](code-quality-gates.md).

```bash
pnpm turbo lint                              # Typecheck (tsc --noEmit)
./agent-harness/verify-size-complexity.sh    # File ≤200 lines
pnpm turbo test                              # Unit + integration
```

Caps: **≤80 lines/function**, **≤200 lines/file**, **cyclomatic ≤10** per function (harness universal rule).

## Production (VPS)

```bash
pm2 logs print3d-api
pm2 reload print3d-api             # Zero-downtime
pm2 monit
./infra/scripts/deploy.sh
```

## Harness

```bash
./agent-harness/resolve-rules.sh <keywords>
./agent-harness/generate-task-rules.sh <keywords>
./agent-harness/generate-task-rules.sh --clean
./agent-harness/verify-size-complexity.sh   # File line cap (200) — run with typecheck
```

## Related documents

- [../INDEX.md](../INDEX.md)
- [code-quality-gates.md](code-quality-gates.md)
- [../testing/contract-first-testing.md](../testing/contract-first-testing.md)
- `.local/phases/`
