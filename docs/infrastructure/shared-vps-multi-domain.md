# Shared VPS — multiple domains (print3d + other site)

> **Live example:** [corvo3d.com.br](https://corvo3d.com.br) — this storefront on a VPS that already hosts another domain.

Nginx routes by `server_name`. Print3d adds **only** its own vhosts (`print3d.conf` or `print3d-ip.conf`). **Do not** remove or disable the other site's `sites-enabled` symlinks.

| Site | Nginx file | `server_name` | App dir |
|------|------------|---------------|---------|
| Other site | (existing) | `otherdomain.example` | (unchanged) |
| Print3d (IP phase) | `print3d-ip.conf` | VPS IP | `/var/www/print3d` |
| Print3d (domain) | `print3d.conf` | `corvo3d.com.br`, `www`, `admin` | `/var/www/print3d` |

Print3d API listens on **127.0.0.1:3101** (not 3001) to avoid clashing with other Node apps.

---

## Why corvo3d.com.br shows the other site

| Layer | Symptom | Cause |
|-------|---------|-------|
| Cloudflare → origin **:443** | Wedding HTML on `corvo3d.com.br` | Print3d has **no HTTPS vhost** yet; the other site's `server` block is `default_server` on 443 |
| Origin **:80** | `Blocked request… allowedHosts` | Nginx routes to print3d, but Vite preview rejected `corvo3d.com.br` until `preview.allowedHosts` is set |

**Fix (does not touch the wedding config):**

1. `./production/deploy-to-vps.sh` — ships Vite host fix + nginx bootstrap
2. On VPS: `./infra/scripts/complete-print3d-domain-ssl.sh` — certbot + HTTPS `print3d.conf`
3. Cloudflare → **Full (strict)**

The wedding site keeps `server_name casamentovitoriaejoao.net.br` only. If it still catches unknown hosts, on the VPS remove `default_server` from the wedding `listen 443` line (edit that site's conf only).

Diagnose on VPS:

```bash
./infra/scripts/diagnose-nginx-vhosts.sh
```

---

## Cloudflare — corvo3d.com.br

DNS → Records (Proxied / orange cloud):

| Type | Name | Content |
|------|------|---------|
| A | `@` | `YOUR_VPS_IP` |
| A or CNAME | `www` | `YOUR_VPS_IP` or apex |
| A | `admin` | `YOUR_VPS_IP` |

**Required:** `admin` — admin panel is `https://admin.corvo3d.com.br`, not a path on the apex.

**Certbot will fail** with `NXDOMAIN` for `admin.corvo3d.com.br` until this record exists. Add it before `./infra/scripts/complete-print3d-domain-ssl.sh`, or certbot will issue a cert for `@` + `www` only (storefront first).

Cache rule: **Bypass** cache for URI path starts with `/api/`.

After Let's Encrypt on the VPS: SSL/TLS → **Full (strict)** + **Always Use HTTPS**.

Full DNS guide: [cloudflare-dns.md](cloudflare-dns.md)

---

## Commands — from your dev machine

```bash
cd /path/to/open-3d-store-free-to-use

# 1. Domain mode env (local only — never commit production/vps.env)
cp production/vps.env.domain.example production/vps.env
# Edit VPS_HOST=YOUR_VPS_IP (real IP), keep DOMAIN=corvo3d.com.br, VPS_USE_HTTPS=1

# 2. Regenerate secrets + sync + build on VPS
chmod +x production/deploy-to-vps.sh infra/scripts/*.sh
./production/deploy-to-vps.sh --env-only   # verify production/env/*.env URLs
./production/deploy-to-vps.sh             # full deploy (add --seed on first catalog load)
```

`vps-full-deploy.sh` installs **domain** nginx when `VPS_USE_HTTPS=1`, otherwise IP nginx.

---

## Commands — on the VPS (SSH)

```bash
ssh -i production/ssh/id_ed25519_print3d root@YOUR_VPS_IP
cd /var/www/print3d

# Confirm both sites are enabled (do NOT delete the other site's .conf)
ls -la /etc/nginx/sites-enabled/

# Domain vhost (HTTP bootstrap if certs missing — safe for other sites on :80/:443)
./infra/scripts/complete-print3d-domain-ssl.sh
pm2 status
```

If `certbot` fails because port 80 is busy, coordinate with the other vhost or use DNS challenge — see [cloudflare-dns.md#7-troubleshooting](cloudflare-dns.md#7-troubleshooting).

---

## Manual verification (required)

| Check | Action |
|-------|--------|
| Storefront | Open **https://corvo3d.com.br** — home, product 3D viewer, thumbnails after navigation |
| API | `curl -sS https://corvo3d.com.br/api/v1/categories` |
| Admin | **https://admin.corvo3d.com.br/login** |
| Other site | Open the **existing domain** in a browser — must still work |
| WhatsApp | Product page → green **Pedir pelo WhatsApp** opens `wa.me` |
| Instagram | Footer icon when `VITE_INSTAGRAM_URL` is set in deploy env |

---

## Rollback (print3d only)

```bash
cp production/vps.env.example production/vps.env   # IP mode
./production/deploy-to-vps.sh
# On VPS: re-enable print3d-ip.conf if needed; other site unchanged
```

---

## Related

- [vps-provisioning.md](vps-provisioning.md)
- [nginx.md](nginx.md)
- [../../production/README.md](../../production/README.md) — local deploy folder (secrets not in git)
- [../../README.md](../../README.md) — **corvo3d.com.br** live URLs
