# Domain go-live — corvo3d.com.br (Cloudflare + shared VPS)

> **Operator guide** for putting the storefront on a real domain when the VPS already hosts another site.
>
> **Live URLs:** **https://corvo3d.com.br** · **https://admin.corvo3d.com.br**

Secrets stay local (`production/vps.env`, `production/env/*.env`) — never commit them.

---

## What you are configuring

| Piece | Role |
|-------|------|
| **Registro.br** | Points domain nameservers to Cloudflare |
| **Cloudflare** | DNS (`@`, `www`, `admin`) + CDN + edge TLS |
| **VPS Nginx** | Routes by `server_name` — print3d vhost **does not** replace the other site |
| **Let's Encrypt** | Origin TLS on the VPS (`certbot`) |
| **PM2** | API `:3101`, web `:4173`, admin `:4174` |

Multi-site detail: [shared-vps-multi-domain.md](shared-vps-multi-domain.md)

---

## Checklist (print)

```
[ ] Cloudflare site added; Registro.br NS updated
[ ] DNS: A @, A admin, CNAME or A www → YOUR_VPS_IP (Proxied)
[ ] production/vps.env → VPS_HOST=real IP, DOMAIN=corvo3d.com.br, VPS_USE_HTTPS=1
[ ] ./production/deploy-to-vps.sh (from dev machine)
[ ] SSH → cd /var/www/print3d → ./infra/scripts/complete-print3d-domain-ssl.sh
[ ] Cloudflare SSL → Full (strict) + Always Use HTTPS
[ ] Manual: corvo3d.com.br + admin + other site still work
```

---

## Step 1 — Cloudflare DNS

**DNS → Records** (orange cloud / **Proxied**):

| Type | Name | Content |
|------|------|---------|
| A | `@` | `YOUR_VPS_IP` |
| A | `admin` | `YOUR_VPS_IP` |
| CNAME or A | `www` | `corvo3d.com.br` or `YOUR_VPS_IP` |

**All three are required before full SSL.** Missing `admin` causes certbot error:

```text
NXDOMAIN looking up A for admin.corvo3d.com.br
```

**Cache rule:** Bypass cache for URI path starts with `/api/`.

More detail: [cloudflare-dns.md](cloudflare-dns.md)

---

## Step 2 — Local machine (`production/vps.env`)

```bash
cd /path/to/open-3d-store-free-to-use
cp production/vps.env.domain.example production/vps.env
```

Edit `production/vps.env` (local only):

```ini
VPS_HOST=YOUR_VPS_IP          # real IPv4 — NOT the placeholder YOUR_VPS_IP
DOMAIN=corvo3d.com.br
VPS_USE_HTTPS=1
```

Verify generated URLs:

```bash
chmod +x production/deploy-to-vps.sh infra/scripts/*.sh
./production/deploy-to-vps.sh --env-only
grep -E "CORS_ORIGIN|ADMIN_ORIGIN|VITE_" production/env/api.env production/env/web.env.production
```

Expected:

- `CORS_ORIGIN=https://corvo3d.com.br`
- `ADMIN_ORIGIN=https://admin.corvo3d.com.br`

---

## Step 3 — Deploy to VPS (local machine)

```bash
./production/deploy-to-vps.sh
```

First catalog load:

```bash
./production/deploy-to-vps.sh --seed
```

Wait until build + PM2 reload finish. If nginx fails on missing certs, continue to Step 4 — HTTP bootstrap is expected before certbot.

---

## Step 4 — SSL on VPS (SSH)

**Important:** run these **after** SSH login, inside `/var/www/print3d`.

```bash
ssh root@YOUR_VPS_IP
cd /var/www/print3d
chmod +x infra/scripts/*.sh
./infra/scripts/complete-print3d-domain-ssl.sh
```

The script:

1. Enables HTTP nginx for `corvo3d.com.br` / `www` / `admin`
2. Runs `certbot --nginx` (skips `admin` if DNS not ready yet)
3. Switches to HTTPS `print3d.conf`
4. Reloads PM2 + nginx

**Manual certbot** (if you prefer):

```bash
dig +short admin.corvo3d.com.br    # must return an IP before including admin

certbot --nginx \
  -d corvo3d.com.br \
  -d www.corvo3d.com.br \
  -d admin.corvo3d.com.br

./infra/scripts/install-nginx-domain.sh
nginx -t && systemctl reload nginx
pm2 reload print3d-web print3d-admin --update-env
```

Storefront only (admin DNS not ready yet):

```bash
certbot --nginx -d corvo3d.com.br -d www.corvo3d.com.br
```

After adding `admin` in Cloudflare, expand the cert:

```bash
certbot --nginx --expand \
  -d corvo3d.com.br \
  -d www.corvo3d.com.br \
  -d admin.corvo3d.com.br
```

---

## Step 5 — Cloudflare SSL (after certbot)

1. **SSL/TLS** → **Full (strict)**
2. **Always Use HTTPS** → On

Do **not** leave **Flexible** once origin has Let's Encrypt — causes redirect loops with nginx HTTPS.

---

## Step 6 — Manual verification (required)

| Check | Command / URL |
|-------|----------------|
| API JSON | `curl -sS https://corvo3d.com.br/api/v1/categories \| head -c 200` |
| Storefront | Open **https://corvo3d.com.br** (mobile: thumbnails after navigation) |
| Admin | **https://admin.corvo3d.com.br/login** (not `/admin/` on subdomain) |
| Other site | Open existing domain — must be unchanged |
| VPS diagnose | `./infra/scripts/diagnose-nginx-vhosts.sh` |

Success: API returns JSON (`[{"id":…`), not `Cannot GET` or wedding HTML.

---

## Common errors

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Could not resolve hostname your_vps_ip` | `VPS_HOST` still placeholder in `production/vps.env` | Set real IPv4 in `VPS_HOST` |
| `No such file or directory` for scripts on VPS | Ran `cd` / scripts **before** SSH, or deploy not synced | SSH first → `cd /var/www/print3d`; run `./production/deploy-to-vps.sh` locally |
| `NXDOMAIN … admin.corvo3d.com.br` | No Cloudflare **A** record for `admin` | Add `admin` → `YOUR_VPS_IP` (Proxied); wait 2–5 min; retry certbot |
| `cannot load certificate … fullchain.pem` | HTTPS nginx before certbot | Re-run `./infra/scripts/complete-print3d-domain-ssl.sh` (uses HTTP bootstrap first) |
| **corvo3d.com.br** shows **another site** | No print3d HTTPS vhost; other site is `default_server` on `:443` | Finish Step 4 (certbot + `install-nginx-domain.sh`) |
| `Blocked request… admin.corvo3d.com.br is not allowed` | Vite admin preview host check | Set `VITE_ADMIN_PUBLIC_HOST` in `admin.env`; redeploy; `pm2 reload print3d-admin` |
| JS `text/plain` / MIME blocked on admin | Stale `VITE_ADMIN_BASE_PATH=/admin` with subdomain URL | Use **https://admin.corvo3d.com.br/** (not `/admin/`); redeploy; nginx serves `/assets/` from `apps/admin/dist` |
| `Cannot GET /api/v1/categories` | Request hits wrong vhost (not print3d API) | Complete SSL + nginx; check `diagnose-nginx-vhosts.sh` |
| Wedding site broke | Removed other site's `sites-enabled` | Re-enable their vhost only; print3d uses `print3d.conf` |
| certbot port 80 busy | Another vhost owns default HTTP | Use `certbot certonly --webroot` or coordinate with other site — [cloudflare-dns.md#7-troubleshooting](cloudflare-dns.md#7-troubleshooting) |
| Cloudflare 522 | UFW / nginx down | `ufw allow 80,443`; `systemctl status nginx` |
| Admin CORS errors | Stale admin bundle still calls apex API (`https://corvo3d.com.br/api/v1`) — **storefront `VITE_API_BASE_URL` exported before admin turbo build** (Vite prefers `process.env` over `.env.production`) | `grep VITE_API apps/admin/.env.production` → `/api/v1`; rebuild admin only: `unset VITE_API_BASE_URL VITE_ASSETS_BASE_URL VITE_WHATSAPP_PHONE && NODE_ENV=production pnpm turbo build --force --filter=@print3d/admin`; `pm2 reload print3d-admin`; hard-refresh browser |

---

## Rollback (print3d only)

```bash
cp production/vps.env.example production/vps.env
./production/deploy-to-vps.sh
```

Other site's nginx config is untouched.

---

## Related

| Doc | Purpose |
|-----|---------|
| [shared-vps-multi-domain.md](shared-vps-multi-domain.md) | Multi-site nginx architecture |
| [cloudflare-dns.md](cloudflare-dns.md) | Registro.br + Cloudflare |
| [nginx.md](nginx.md) | Vhost templates, SSL bootstrap |
| [vps-provisioning.md](vps-provisioning.md) | Full VPS bootstrap |
| [../../production/README.md](../../production/README.md) | Local deploy folder |
| [../../README.md](../../README.md) | **corvo3d.com.br** quick links |
