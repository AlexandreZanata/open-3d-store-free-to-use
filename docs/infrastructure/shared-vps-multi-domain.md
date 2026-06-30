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

## Cloudflare — corvo3d.com.br

DNS → Records (Proxied / orange cloud):

| Type | Name | Content |
|------|------|---------|
| A | `@` | `YOUR_VPS_IP` |
| A or CNAME | `www` | `YOUR_VPS_IP` or apex |
| A | `admin` | `YOUR_VPS_IP` |

**Required:** `admin` — admin panel is `https://admin.corvo3d.com.br`, not a path on the apex.

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

# Domain vhost (safe — only touches print3d-* files)
./infra/scripts/install-nginx-domain.sh

# Let's Encrypt (all three hostnames)
certbot --nginx \
  -d corvo3d.com.br \
  -d www.corvo3d.com.br \
  -d admin.corvo3d.com.br

nginx -t && systemctl reload nginx
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
