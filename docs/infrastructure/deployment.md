# Infrastructure & Deployment

## VPS RAM budget (16 GB Hostinger)

| Service | RAM | Notes |
|---------|-----|-------|
| PostgreSQL 18.4 | 4 GB | `shared_buffers=1GB`, `work_mem=64MB`; native `uuidv7()` |
| Redis 8.8 | 512 MB | `maxmemory 512mb`, `allkeys-lru` |
| Node.js API (PM2) | 2 GB | 2 workers × ~1 GB |
| Nginx | 64 MB | Reverse proxy + static |
| OS + headroom | ~9 GB | Swap, growth |

## Production paths

| Path | Purpose |
|------|---------|
| `/var/www/print3d/` | Git clone, monorepo root |
| `/var/www/print3d/web/` | React build output (Nginx root) |
| `/var/www/print3d/models/` | `.glb`, thumbnails, images |

## PM2 ecosystem

**File:** `infra/pm2.ecosystem.config.js`

| Setting | Value |
|---------|-------|
| App name | `print3d-api` |
| Script | `./apps/api/dist/http/server.js` |
| Instances | 2 (cluster) |
| max_memory_restart | 900M |
| PORT | 3001 |
| bind | 127.0.0.1 (Nginx only) |

## Deploy script

**File:** `infra/scripts/deploy.sh`

Steps: git pull → `pnpm install --frozen-lockfile` → turbo build (shared-types, whatsapp, api) → migrate → `pm2 reload print3d-api`

## SSL

```bash
certbot --nginx -d yourdomain.com
```

## Related documents

- [nginx.md](nginx.md)
- [docker-compose.md](docker-compose.md)
- [environment.md](environment.md)
- [../operations/ci-cd.md](../operations/ci-cd.md)
- `.local/phases/08-production-deployment.md`
