# Production secrets (local / VPS)

This folder holds **production-only** configuration. Real values never belong in git.

## Layout

| Path | Purpose | In git? |
|------|---------|---------|
| `env/*.example` | Placeholder templates | Yes |
| `env/api.env` | API secrets for VPS | **No** |
| `env/web.env.production` | Storefront build-time URLs | **No** |
| `env/admin.env` | Admin panel build-time URLs | **No** |
| `env/*.local` | Any local overrides | **No** |

## First-time setup

```bash
cp production/env/api.env.example production/env/api.env
cp production/env/web.env.production.example production/env/web.env.production
cp production/env/admin.env.example production/env/admin.env
# Edit each file with real VPS values (domain, DB password, session secret, etc.)
```

## Deploy on VPS

Copy secrets into the running tree (or symlink):

```bash
install -m 600 production/env/api.env /var/www/print3d/apps/api/.env
install -m 600 production/env/web.env.production /var/www/print3d/apps/web/.env.production
install -m 600 production/env/admin.env /var/www/print3d/apps/admin/.env
```

Then run `./infra/scripts/deploy.sh` from the repo root on the server.

See [docs/infrastructure/deployment.md](../docs/infrastructure/deployment.md).
