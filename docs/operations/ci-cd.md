# CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

## Triggers

- Push to `main`, `develop`
- Pull requests to `main`

## Job: test (unit + integration + infra contract)

Services: PostgreSQL 18.4, Redis 8.8

Steps:
1. checkout (with harness submodule)
2. pnpm setup (from `packageManager` in root `package.json`)
3. Node 22
4. `pnpm install --frozen-lockfile`
5. `pnpm --filter @print3d/api exec drizzle-kit migrate`
6. **`./scripts/quality-gate.sh ci`** — typecheck, ESLint (no `any`/`unknown`), size/complexity, infra contract, build, **migrations** (when `DATABASE_URL` is set), tests

Vitest also runs Drizzle migrations in `apps/api/tests/globalSetup.ts` before integration tests so the schema matches the migration journal even if an earlier migrate step was skipped.

> **Quality Gate:** typecheck, ESLint strict types, size/complexity, build, and tests are **paired gates** — all must pass. Harness rule: `agent-rules/00-core/size-and-complexity-limits.md`.

> Tests MUST follow [../testing/contract-first-testing.md](../testing/contract-first-testing.md). Failing contract tests block merge.

## Job: e2e

Runs after `test` job passes.

Steps:
1. `pnpm --filter @print3d/api exec drizzle-kit migrate`
2. Write `apps/api/.env` from workflow env (required by `tsx --env-file=.env` for `db:seed` and API `dev` in Playwright webServer)
3. `pnpm --filter @print3d/api db:seed`
4. Install Playwright browsers: `pnpm exec playwright install chromium --with-deps`
5. **`pnpm e2e`**
6. Upload Playwright report on failure

Minimum suites: catalog browse, product detail, WhatsApp redirect, i18n locale switch — see [../testing/tdd-strategy.md](../testing/tdd-strategy.md).

## Job: deploy

- Runs only on push to `main`
- Needs: **test** and **e2e** jobs pass
- SSH to VPS → run `infra/scripts/deploy.sh`

## GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `VPS_HOST` | Server IP/hostname |
| `VPS_USER` | SSH user |
| `VPS_SSH_KEY` | Private key |

## Harness rules

- `agent-rules/08-devops-and-delivery/ci-cd-gates.md`
- `agent-rules/08-devops-and-delivery/rollback-readiness.md`

## Related documents

- [../testing/contract-first-testing.md](../testing/contract-first-testing.md)
- [../testing/tdd-strategy.md](../testing/tdd-strategy.md)
- [deployment.md](../infrastructure/deployment.md)
- `.local/phases/08-production-deployment.md`
