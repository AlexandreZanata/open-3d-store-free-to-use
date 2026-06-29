# DNS cutover — real domain (Cloudflare active)

> Run this checklist **after** Registro.br nameservers point to Cloudflare **and** DNS records resolve.
> Until then, keep using IP mode — see [README.md](README.md) Phase 1.

## Current vs target

| | Phase 1 (now) | Phase 2 (this doc) |
|---|---------------|-------------------|
| Access | `http://72.60.147.2` | `https://yourdomain.com.br` |
| Admin | `http://72.60.147.2/admin/` | `https://admin.yourdomain.com.br` |
| Nginx | `infra/nginx/nginx.ip.conf` | `infra/nginx/nginx.conf` + Let's Encrypt |
| `production/vps.env` | `VPS_USE_HTTPS=0`, `DOMAIN=72.60.147.2` | `VPS_USE_HTTPS=1`, `DOMAIN=yourdomain.com.br` |

Replace `yourdomain.com.br` with your real domain everywhere below.

---

## Prerequisites

- [ ] Store already running on IP (`./production/deploy-to-vps.sh` succeeded)
- [ ] Cloudflare site added; **two nameservers** copied
- [ ] Registro.br → **Alterar servidores DNS** → Cloudflare NS saved
- [ ] Propagation OK (`dig +short yourdomain.com.br` returns Cloudflare or VPS IP)
- [ ] Other site on the same VPS keeps its own domain — only **print3d** vhosts change

Full DNS reference: [docs/infrastructure/cloudflare-dns.md](../docs/infrastructure/cloudflare-dns.md)

---

## Step 1 — Cloudflare DNS records

**DNS → Records** (Proxied / orange cloud):

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `72.60.147.2` | Proxied |
| A | `www` | `72.60.147.2` | Proxied |
| A | `admin` | `72.60.147.2` | Proxied |

**Cache rule:** bypass cache for URI path starting with `/api/`.

---

## Step 2 — Update local config

Copy the domain template:

```bash
cp production/vps.env.domain.example production/vps.env
```

Edit `production/vps.env`:

```ini
DOMAIN=yourdomain.com.br
VPS_USE_HTTPS=1
VPS_HOST=72.60.147.2
```

Or use the helper script:

```bash
chmod +x production/switch-to-domain.sh
./production/switch-to-domain.sh yourdomain.com.br --env-only
```

Verify generated env:

```bash
grep -E "CORS_ORIGIN|ADMIN_ORIGIN|VITE_" production/env/api.env production/env/web.env.production
```

Expected:

- `CORS_ORIGIN=https://yourdomain.com.br`
- `ADMIN_ORIGIN=https://admin.yourdomain.com.br`
- `VITE_*` URLs use `https://yourdomain.com.br`

WhatsApp stays `5566997227927` unless you change it in `production/deploy-to-vps.sh`.

---

## Step 3 — Deploy with domain env

```bash
./production/deploy-to-vps.sh
```

This syncs code, rebuilds frontends with new URLs, and installs the **domain** nginx template (not IP).

---

## Step 4 — SSL on VPS (SSH)

```bash
ssh -i production/ssh/id_ed25519_print3d root@72.60.147.2
cd /var/www/print3d

# Disable temporary IP-only site
rm -f /etc/nginx/sites-enabled/print3d-ip.conf

# Domain nginx (substitutes yourdomain.com.br)
./infra/scripts/install-nginx-domain.sh

# Let's Encrypt — all three hostnames
certbot --nginx \
  -d yourdomain.com.br \
  -d www.yourdomain.com.br \
  -d admin.yourdomain.com.br

nginx -t && systemctl reload nginx
```

If port 80 is shared with another site, run certbot during a quiet window or use DNS challenge — see [Cloudflare doc](../docs/infrastructure/cloudflare-dns.md#7-troubleshooting).

---

## Step 5 — Cloudflare SSL mode

After certbot succeeds:

1. Cloudflare → **SSL/TLS** → **Full (strict)**
2. **Always Use HTTPS** → On

---

## Step 6 — Manual verification

| Check | Command / URL |
|-------|----------------|
| Storefront | Open `https://yourdomain.com.br` |
| API | `curl -sS https://yourdomain.com.br/api/v1/categories` |
| Admin | `https://admin.yourdomain.com.br/login` |
| WhatsApp link | Footer shows correct number |
| PM2 | `pm2 status` — all three apps online |
| Old IP | `http://72.60.147.2` may stop serving print3d (expected) |

---

## Step 7 — GitHub Actions (optional)

Repo secrets unchanged:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | `72.60.147.2` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | deploy private key |

CI deploy uses `infra/scripts/deploy.sh` on the VPS — no DNS change needed in GitHub.

---

## Rollback to IP (emergency)

```bash
cp production/vps.env.example production/vps.env   # IP template
./production/deploy-to-vps.sh
# On VPS: re-enable print3d-ip.conf, disable print3d.conf if needed
```

---

## Checklist (print)

```
[ ] Cloudflare NS active at Registro.br
[ ] A records @, www, admin → 72.60.147.2
[ ] production/vps.env → DOMAIN + VPS_USE_HTTPS=1
[ ] ./production/deploy-to-vps.sh
[ ] certbot --nginx (3 hostnames)
[ ] Cloudflare Full (strict)
[ ] Manual browser + curl checks
```

---

## Related

- [README.md](README.md) — production folder overview
- [vps.env.domain.example](vps.env.domain.example) — domain `vps.env` template
- [ssh/README.md](ssh/README.md) — SSH keys
- [../docs/infrastructure/cloudflare-dns.md](../docs/infrastructure/cloudflare-dns.md)
- [../docs/infrastructure/vps-provisioning.md](../docs/infrastructure/vps-provisioning.md)
