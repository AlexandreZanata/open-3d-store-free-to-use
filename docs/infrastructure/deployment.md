# Infrastructure & Deployment

## VPS RAM budget (16 GB Hostinger)

| Service | RAM | Notes |
|---------|-----|-------|
| PostgreSQL 18.4 | 4 GB | `shared_buffers=1GB`, `work_mem=64MB`; native `uuidv7()` |
| Redis 8.8 | 512 MB | `maxmemory 512mb`, `allkeys-lru` |
| Node.js API (PM2) | 2 GB | 2 workers × ~1 GB |
| TanStack Start web (PM2) | 512 MB | SSR via `vite preview` on `127.0.0.1:4173` |
| Admin SPA (PM2) | 384 MB | `vite preview` on `127.0.0.1:4174` |
| Nginx | 64 MB | Reverse proxy + `/models/` static |
| OS + headroom | ~9 GB | Swap, growth |

## Production paths

| Path | Purpose |
|------|---------|
| `/var/www/print3d/` | Git clone, monorepo root |
| `/var/www/print3d/models/` | `.glb`, thumbnails, images (Nginx alias) |
| `/var/www/print3d/apps/api/.env` | Production API secrets (not in git) |
| `/var/www/print3d/apps/web/.env.production` | Vite build-time URLs (not in git) |

The storefront runs as a **TanStack Start SSR** process (`print3d-web` in PM2). Nginx proxies `/` and hashed assets to `127.0.0.1:4173`; it does not serve a standalone `index.html` tree.

## PM2 ecosystem

**File:** `infra/pm2.ecosystem.config.js`

| App | Script | Instances | Notes |
|-----|--------|-----------|-------|
| `print3d-api` | `./apps/api/dist/main.js` | 2 (cluster) | `PORT=3101` via `apps/api/.env`, `--env-file` in PM2 |
| `print3d-web` | `pnpm --filter @print3d/web start` | 1 (fork) | `vite preview` on `127.0.0.1:4173` |
| `print3d-admin` | `pnpm --filter @print3d/admin preview` | 1 (fork) | `127.0.0.1:4174` |

| Setting | Value |
|---------|-------|
| API max_memory_restart | 900M |
| Web max_memory_restart | 512M |
| Admin max_memory_restart | 384M |

```bash
pm2 start infra/pm2.ecosystem.config.js --env production
pm2 startup && pm2 save
```

## Deploy script

**File:** `infra/scripts/deploy.sh`

Steps: `git pull --ff-only` → `pnpm install --frozen-lockfile` → turbo build (`shared-types`, `whatsapp`, `api`, `web`, `admin`) → `migrate.sh` → `pm2 reload` (API + web + admin)

Build reads `CORS_ORIGIN` from `apps/api/.env` to derive `VITE_*` URLs when `apps/web/.env.production` is absent.

## Migrate script

**File:** `infra/scripts/migrate.sh`

Sources `apps/api/.env`, then runs `drizzle-kit migrate` in `apps/api/`.

## Manual VPS deploy (`production/deploy-to-vps.sh`)

Rsync deploy from your machine (see [../../production/README.md](../../production/README.md)):

| Command | Seed |
|---------|------|
| `./production/deploy-to-vps.sh` | **No** — migrate + build + PM2 + nginx only |
| `./production/deploy-to-vps.sh --seed` | **Yes** — runs `infra/scripts/vps-seed.sh` (`pnpm db:seed`, hero GLB, thumbnails) |
| `./production/deploy-to-vps.sh --env-only` | No — regenerates `production/env/*.env` locally |

On the VPS, `vps-full-deploy.sh` runs seed only when `RUN_VPS_SEED=1` (set by `--seed` on the deploy script). **Hero GLB** (`install-hero-logo-glb.sh`) runs on **every** deploy — copied from `apps/api/seed-assets/hero/corvo-logo-preview.glb` to `models/3d/`.

## First deploy (VPS checklist)

Full walkthrough: [vps-provisioning.md](vps-provisioning.md) · DNS: [cloudflare-dns.md](cloudflare-dns.md)

1. Install Node.js 22 LTS, pnpm 9, PM2, Nginx, certbot (or run `infra/scripts/bootstrap-vps.sh`)
2. Docker Compose prod data layer **or** native PostgreSQL 18.4 + Redis 8.8
3. Copy `infra/nginx/nginx.conf` → `/etc/nginx/sites-available/print3d.conf`, enable site
4. Cloudflare DNS → A records to VPS; Registro.br NS → Cloudflare
5. `certbot --nginx -d yourdomain.com.br -d www.yourdomain.com.br -d admin.yourdomain.com.br`
6. Clone repo to `/var/www/print3d`, sync secrets (`infra/scripts/sync-to-vps.sh`)
7. Create `/var/www/print3d/models/{3d,thumbnails,images}/`, upload `.glb` via SCP
8. `./infra/scripts/first-deploy.sh` then `pm2 startup && pm2 save`

## SSL

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Related documents

- [vps-provisioning.md](vps-provisioning.md)
- [cloudflare-dns.md](cloudflare-dns.md)
- [kubernetes.md](kubernetes.md)
- [nginx.md](nginx.md)
- [docker-compose.md](docker-compose.md)
- [environment.md](environment.md)
- [../operations/ci-cd.md](../operations/ci-cd.md)
- `.local/phases/08-production-deployment.md`
