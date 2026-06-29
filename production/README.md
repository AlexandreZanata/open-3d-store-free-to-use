# Production secrets (local / VPS)

This folder holds **production-only** configuration. Real values never belong in git.

## Layout

| Path | Purpose | In git? |
|------|---------|---------|
| `env/*.example` | Placeholder templates | Yes |
| `env/api.env` | API secrets for VPS | **No** |
| `env/web.env.production` | Storefront build-time URLs | **No** |
| `env/admin.env` | Admin panel build-time URLs | **No** |
| `env/docker.env` | Docker Compose data-layer passwords | **No** |
| `vps.env.example` | SSH host, user, domain | Yes (template) |
| `vps.env` | Real VPS connection | **No** |
| `ssh/README.md` | SSH key setup guide | Yes |
| `ssh/id_*` | Deploy private keys | **No** |

## First-time setup (local)

```bash
chmod +x infra/scripts/*.sh
./infra/scripts/generate-secrets.sh
# Edit domain, WhatsApp, vps.env
./infra/scripts/install-env.sh   # optional: test build locally
```

## Sync secrets to VPS

```bash
./infra/scripts/sync-to-vps.sh
```

Requires `production/vps.env` and SSH key — see [ssh/README.md](ssh/README.md).

## Deploy on VPS

Copy secrets into the running tree:

```bash
install -m 600 production/env/api.env /var/www/print3d/apps/api/.env
install -m 600 production/env/web.env.production /var/www/print3d/apps/web/.env.production
install -m 600 production/env/admin.env /var/www/print3d/apps/admin/.env.production
```

Or run `./infra/scripts/install-env.sh` from repo root.

Then run `./infra/scripts/deploy.sh` from the repo root on the server.

Full guide: [docs/infrastructure/vps-provisioning.md](../docs/infrastructure/vps-provisioning.md).
