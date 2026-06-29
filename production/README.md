# Production secrets (local / VPS)

This folder holds **production-only** configuration. Real values never belong in git.

## Deployment phases

| Phase | When | Doc | Command |
|-------|------|-----|---------|
| **1 — IP (now)** | DNS not ready; other site uses the domain | below | `./production/deploy-to-vps.sh` |
| **2 — Domain** | Cloudflare NS active at Registro.br | [DNS-CUTOVER.md](DNS-CUTOVER.md) | `./production/switch-to-domain.sh yourdomain.com.br` |

---

## Phase 1 — IP access (current)

VPS: `72.60.147.2` · HTTP only · no certbot

| URL | Path |
|-----|------|
| Store | `http://72.60.147.2` |
| Admin | `http://72.60.147.2/admin/` |
| API | `http://72.60.147.2/api/v1` |

Config template: [vps.env.example](vps.env.example) (`DOMAIN=72.60.147.2`, `VPS_USE_HTTPS=0`).

```bash
chmod +x production/deploy-to-vps.sh infra/scripts/*.sh
./production/deploy-to-vps.sh
```

Env only:

```bash
./production/deploy-to-vps.sh --env-only
```

---

## Phase 2 — Real domain (after Cloudflare DNS)

**Start here:** [DNS-CUTOVER.md](DNS-CUTOVER.md)

Quick summary:

1. Cloudflare A records → `72.60.147.2` (`@`, `www`, `admin`)
2. `cp production/vps.env.domain.example production/vps.env` → set `DOMAIN`
3. `./production/switch-to-domain.sh yourdomain.com.br`
4. SSH → `certbot --nginx` (three hostnames)
5. Cloudflare → SSL **Full (strict)**

---

## Layout

| Path | Purpose | In git? |
|------|---------|---------|
| `DNS-CUTOVER.md` | Go-live checklist when DNS is active | Yes |
| `deploy-to-vps.sh` | Sync + build on VPS | Yes |
| `switch-to-domain.sh` | IP → domain transition | Yes |
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
