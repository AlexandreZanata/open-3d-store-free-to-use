# Production env files

Copy `*.example` → real filenames (without `.example`). **Never commit** `api.env`, `web.env.production`, `admin.env`, `docker.env`, or `vps.env`.

## VPS deploy (local only — not in git)

Keep on your machine and on the server only:

| File | Purpose |
|------|---------|
| `production/vps.env` | SSH target (`VPS_HOST`, `VPS_USER`, `DOMAIN`) |
| `production/deploy-to-vps.sh` | Rsync + remote build + seed |
| `production/sync-models-to-vps.sh` | Push `models/` from dev |
| `production/README.md` | Your VPS runbook (IP, URLs) |
| `infra/pm2.ecosystem.config.js` | Copy from `infra/pm2.ecosystem.config.example.js` |
| `infra/scripts/vps-*.sh` | Server deploy/diagnose/seed |

Generic docs (safe for GitHub): [../../docs/infrastructure/deployment.md](../../docs/infrastructure/deployment.md), [../../docs/infrastructure/vps-provisioning.md](../../docs/infrastructure/vps-provisioning.md).
