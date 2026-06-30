# CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

## Branch workflow

| Branch | Purpose |
|--------|---------|
| **`developing`** | Day-to-day commits and pushes |
| **`main`** | Production; merge only via PR when CI is green |

```bash
git checkout developing
git pull origin developing
# … work …
git push origin developing
# Open PR: developing → main on GitHub
```

Protect `main` after the first `developing` push:

```bash
chmod +x scripts/setup-github-branch-protection.sh
./scripts/setup-github-branch-protection.sh
```

## Triggers

- Push to `main`, `developing`
- Pull requests to `main`, `developing`

## Job: test (unit + integration + infra contract)

Services: PostgreSQL 18.4, Redis 8.8

Steps:
1. checkout (with harness submodule)
2. pnpm setup (from `packageManager` in root `package.json`)
3. Node 22
4. `pnpm install --frozen-lockfile`
5. `pnpm --filter @print3d/api exec drizzle-kit migrate`
6. **`./scripts/quality-gate.sh ci`** — typecheck, ESLint (no `any`/`unknown`), size/complexity, infra contract, build, **migrations** (when `DATABASE_URL` is set), tests

## Job: e2e

Runs after `test` job passes. See workflow file for build/seed/playwright steps.

## Job: deploy

- Runs only on **push to `main`** after **test** and **e2e** pass
- **Skipped (green)** when `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` are not configured — CI does not fail
- SSH to VPS → `git pull` + `infra/scripts/deploy.sh` (same end state as manual deploy on server)

## GitHub Secrets (Settings → Secrets and variables → Actions)

| Secret | Purpose |
|--------|---------|
| `VPS_HOST` | Server IP/hostname |
| `VPS_USER` | SSH user |
| `VPS_SSH_KEY` | Private key PEM (no passphrase) |

Never store these in git. Local plaintext: `production/vault/` + `./scripts/production-vault.sh` — see [../../production/vault/README.md](../../production/vault/README.md).

Before push: `./scripts/verify-no-production-secrets.sh`

## Related documents

- [../testing/contract-first-testing.md](../testing/contract-first-testing.md)
- [deployment.md](../infrastructure/deployment.md)
- [../../production/vault/README.md](../../production/vault/README.md)
