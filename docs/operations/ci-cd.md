# CI/CD Pipeline

**File:** `.github/workflows/ci.yml`

## Triggers

- Push to `main`, `develop`
- Pull requests to `main`

## Job: test

Services: PostgreSQL 18.4, Redis 8.8

Steps:
1. checkout
2. pnpm setup (v9)
3. Node 22
4. `pnpm install --frozen-lockfile`
5. Build `@print3d/shared-types`, `@print3d/whatsapp`
6. `pnpm turbo test --filter=api --filter=@print3d/whatsapp`
7. `pnpm turbo lint`

## Job: deploy

- Runs only on push to `main`
- Needs: test job pass
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

- [deployment.md](../infrastructure/deployment.md)
- `.local/phases/08-production-deployment.md`
