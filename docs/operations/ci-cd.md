# CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

## Triggers

- Push to `main`, `develop`
- Pull requests to `main`

## Job: test (unit + integration)

Services: PostgreSQL 18.4, Redis 8.8

Steps:
1. checkout
2. pnpm setup (v9)
3. Node 22
4. `pnpm install --frozen-lockfile`
5. **`./scripts/quality-gate.sh ci`** — typecheck, ESLint (no `any`/`unknown`), size/complexity, build, tests

> **Quality Gate:** typecheck, ESLint strict types, size/complexity, build, and tests are **paired gates** — all must pass. Harness rule: `agent-rules/00-core/size-and-complexity-limits.md`.

> Tests MUST follow [../testing/contract-first-testing.md](../testing/contract-first-testing.md). Failing contract tests block merge.

## Job: e2e (Phase 7+)

Runs after `test` job passes.

Steps:
1. Install Playwright browsers: `pnpm exec playwright install chromium --with-deps`
2. Start API + web (or use `webServer` in `playwright.config.ts`)
3. **`pnpm e2e`**
4. Upload Playwright report on failure

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
