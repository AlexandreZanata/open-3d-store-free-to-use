# Infrastructure & Deployment

## VPS RAM budget (16 GB Hostinger)

| Service | RAM | Notes |
|---------|-----|-------|
| PostgreSQL 18.4 | 4 GB | `shared_buffers=1GB`, `work_mem=64MB`; native `uuidv7()` |
| Redis 8.8 | 512 MB | `maxmemory 512mb`, `allkeys-lru` |
| Node.js API (PM2) | 2 GB | 2 workers × ~1 GB |
| TanStack Start web (PM2) | 512 MB | SSR via `vite preview` on `127.0.0.1:4173` |
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
| `print3d-api` | `./apps/api/dist/main.js` | 2 (cluster) | `PORT=3001`, bind `127.0.0.1` |
| `print3d-web` | `pnpm --filter @print3d/web start` | 1 (fork) | `vite preview` on `127.0.0.1:4173` |

| Setting | Value |
|---------|-------|
| API max_memory_restart | 900M |
| Web max_memory_restart | 512M |

```bash
pm2 start infra/pm2.ecosystem.config.js --env production
pm2 startup && pm2 save
```

## Deploy script

**File:** `infra/scripts/deploy.sh`

Steps: `git pull --ff-only` → `pnpm install --frozen-lockfile` → turbo build (`shared-types`, `whatsapp`, `api`, `web`) → `migrate.sh` → `pm2 reload` (API + web)

Build reads `CORS_ORIGIN` from `apps/api/.env` to derive `VITE_*` URLs when `apps/web/.env.production` is absent.

## Migrate script

**File:** `infra/scripts/migrate.sh`

Sources `apps/api/.env`, then runs `drizzle-kit migrate` in `apps/api/`.

## First deploy (VPS checklist)

1. Install Node.js 22 LTS, pnpm 9, PM2, PostgreSQL 18.4, Redis 8.8, Nginx, certbot
2. Tune PostgreSQL — see [../operations/performance-caching.md](../operations/performance-caching.md)
3. Copy `infra/nginx/nginx.conf` → `/etc/nginx/sites-available/print3d.conf`, enable site, `nginx -t && systemctl reload nginx`
4. `certbot --nginx -d yourdomain.com`
5. Clone repo to `/var/www/print3d`, init harness submodule if used
6. Create `apps/api/.env` and `apps/web/.env.production` from examples
7. Create `/var/www/print3d/models/{3d,thumbnails,images}/`, upload `.glb` via SCP
8. `./infra/scripts/deploy.sh` then `pm2 startup && pm2 save`

## SSL

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Related documents

- [nginx.md](nginx.md)
- [docker-compose.md](docker-compose.md)
- [environment.md](environment.md)
- [../operations/ci-cd.md](../operations/ci-cd.md)
- `.local/phases/08-production-deployment.md`
