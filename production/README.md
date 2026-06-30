# Production secrets (local / VPS)

This folder holds **production-only** configuration. Real values never belong in git.

## Live site

| | URL |
|---|-----|
| **Storefront** | **https://corvo3d.com.br** |
| **Admin** | **https://admin.corvo3d.com.br** |

Multi-site VPS (other domain unchanged): [../docs/infrastructure/shared-vps-multi-domain.md](../docs/infrastructure/shared-vps-multi-domain.md)

## Deployment phases

| Phase | When | Doc | Command |
|-------|------|-----|---------|
| **1 — IP** | DNS not ready | below | `./production/deploy-to-vps.sh` |
| **2 — Domain** | Cloudflare active for **corvo3d.com.br** | [DNS-CUTOVER.md](DNS-CUTOVER.md) (local) | `./production/deploy-to-vps.sh` after `vps.env` domain mode |

---

## Phase 1 — IP access

| URL | Path |
|-----|------|
| Store | `http://YOUR_VPS_IP` |
| Admin | `http://YOUR_VPS_IP/admin/` |
| API | `http://YOUR_VPS_IP/api/v1` |

Config template: [vps.env.example](vps.env.example) (`DOMAIN=YOUR_VPS_IP`, `VPS_USE_HTTPS=0`).

```bash
chmod +x production/deploy-to-vps.sh infra/scripts/*.sh
./production/deploy-to-vps.sh
```

SSH password is asked **once** per run (ControlMaster reuses the session for rsync + remote deploy). With an SSH key, no password prompt.

Env only:

```bash
./production/deploy-to-vps.sh --env-only
```

### Catalog / database seed (opt-in)

**Default deploy does not seed.** Migrations and build still run; catalog data is unchanged.

First deploy or refresh catalog + hero GLB + thumbnails:

```bash
./production/deploy-to-vps.sh --seed
```

Runs **`vps-seed.sh`** on the VPS after migrate/build (idempotent upsert). Product GLB previews need STL/3MF in `/var/www/print3d/seed-models/`, or push from dev:

```bash
pnpm --filter @print3d/api db:seed
./production/sync-models-to-vps.sh
```

Create the **admin user** manually in production (bootstrap env vars are disabled). See [docs/operations/commands-reference.md](../docs/operations/commands-reference.md).

### `GET /api/v1/me` returns 401 in the browser

**Expected for guests.** `/me` is the signed-in profile — not public catalog data. The storefront treats 401 as “not logged in”; categories/products work without login.

---

## Phase 2 — corvo3d.com.br (after Cloudflare DNS)

**Start here:** [domain-go-live-corvo3d.md](../docs/infrastructure/domain-go-live-corvo3d.md) (in git) · [DNS-CUTOVER.md](DNS-CUTOVER.md) (local)

Quick summary:

1. Cloudflare A records → your VPS IP (`@`, `www`, **`admin`**)
2. `cp production/vps.env.domain.example production/vps.env` → `DOMAIN=corvo3d.com.br`, `VPS_USE_HTTPS=1`, **`VPS_HOST=real IP`**
3. `./production/deploy-to-vps.sh`
4. SSH → `cd /var/www/print3d` → `./infra/scripts/complete-print3d-domain-ssl.sh`
5. Cloudflare → SSL **Full (strict)**
6. Verify **corvo3d.com.br** and the **other site** still work

See [Common errors](../docs/infrastructure/domain-go-live-corvo3d.md#common-errors) for NXDOMAIN, wrong site, Vite host block, etc.

---

## Layout

| Path | Purpose | In git? |
|------|---------|---------|
| `DNS-CUTOVER.md` | Go-live checklist when DNS is active | **No** (local) |
| `deploy-to-vps.sh` | Sync + build on VPS | Yes |
| `sync-models-to-vps.sh` | Push `models/` from dev to VPS | Yes |
| `switch-to-domain.sh` | IP → domain transition | **No** (local) |
| `env/*.example` | Placeholder templates | Yes |
| `env/api.env` | API secrets for VPS | **No** |
| `env/web.env.production` | Storefront build-time URLs | **No** |
| `env/admin.env` | Admin panel build-time URLs | **No** |
| `env/docker.env` | Docker Compose passwords | **No** |
| `vps.env.example` | IP-mode VPS target | Yes |
| `vps.env.domain.example` | Domain-mode VPS target | Yes |
| `vps.env` | Active VPS connection | **No** |
| `ssh/README.md` | SSH key setup | Yes |
| `ssh/id_*` | Deploy private keys | **No** |

---

## First-time secrets (local)

```bash
chmod +x infra/scripts/*.sh
./infra/scripts/generate-secrets.sh
./infra/scripts/install-env.sh   # optional local test
```

Sync secrets only:

```bash
./infra/scripts/sync-to-vps.sh
```

SSH keys: [ssh/README.md](ssh/README.md)

---

## Troubleshooting

### `husky: not found` / `ELIFECYCLE` on `pnpm install`

`NODE_ENV=production` skips devDependencies; build needs them. Fixed in `deploy.sh` — on VPS run:

```bash
cd /var/www/print3d
export HUSKY=0
NODE_ENV=development SKIP_GIT_PULL=1 ./infra/scripts/deploy.sh
pm2 save
```

### `pnpm: command not found`

Node.js or pnpm not installed on VPS. As **root**:

```bash
cd /var/www/print3d
chmod +x infra/scripts/ensure-node.sh
./infra/scripts/ensure-node.sh
SKIP_GIT_PULL=1 ./infra/scripts/deploy.sh
```

Or full bootstrap: `./infra/scripts/bootstrap-vps.sh`

### `POSTGRES_PASSWORD is missing` on `docker compose ps`

Containers may still be running. Always pass the env file:

```bash
docker compose -f infra/docker-compose.prod.yml --env-file production/env/docker.env ps
```

Rebuild `docker.env` from `api.env`:

```bash
./infra/scripts/repair-docker-env.sh
./infra/scripts/up-data-layer.sh
```

### `POSTGRES_PASSWORD is missing a value` (compose up)

`production/env/docker.env` is incomplete. Rebuild from `api.env` (passwords must match):

```bash
cd /var/www/print3d
chmod +x infra/scripts/repair-docker-env.sh
./infra/scripts/repair-docker-env.sh
./infra/scripts/up-data-layer.sh
```

Or from your machine: `./production/deploy-to-vps.sh --env-only` then sync.

### `Bind for 0.0.0.0:5432 failed: port is already allocated`

The VPS already runs native Postgres (common on Hostinger). Docker uses **alternate host ports** via `production/env/docker.env`:

| Service | Host port (default) |
|---------|---------------------|
| Postgres | `5433` |
| Redis | `6380` |
| RabbitMQ | `5673` |

Regenerate env and restart data layer:

```bash
./production/deploy-to-vps.sh --env-only
./production/deploy-to-vps.sh   # syncs updated docker-compose.prod.yml from local
```

**On VPS manually:** the compose file must use `${POSTGRES_HOST_PORT:-5433}` — if you still see `5432` in the error, sync from local:

```bash
# From your machine:
scp -i production/ssh/id_ed25519_print3d infra/docker-compose.prod.yml root@72.60.147.2:/var/www/print3d/infra/
```

Then on VPS:

```bash
cd /var/www/print3d
./infra/scripts/up-data-layer.sh
SKIP_GIT_PULL=1 ./infra/scripts/deploy.sh
```

### `fatal: not a git repository`

Normal for rsync deploy (no `.git` on VPS). Use:

```bash
SKIP_GIT_PULL=1 ./infra/scripts/deploy.sh
```

Or re-run `./production/deploy-to-vps.sh` from your machine (sets this automatically).

---

- [docs/infrastructure/cloudflare-dns.md](../docs/infrastructure/cloudflare-dns.md) — Cloudflare + Registro.br
- [docs/infrastructure/vps-provisioning.md](../docs/infrastructure/vps-provisioning.md) — full VPS setup
- [docs/infrastructure/deployment.md](../docs/infrastructure/deployment.md) — PM2, nginx, deploy script
