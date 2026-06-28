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
```

## Related documents

- [../INDEX.md](../INDEX.md)
- [../testing/contract-first-testing.md](../testing/contract-first-testing.md)
- `.local/phases/`
