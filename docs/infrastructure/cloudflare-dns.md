# Cloudflare + Registro.br DNS

> Publish the VPS (`72.60.147.2`) behind Cloudflare proxy with HTTPS.

## Prerequisites

- Domain registered at [Registro.br](https://registro.br)
- VPS running Nginx on ports 80/443 (see [vps-provisioning.md](vps-provisioning.md))
- Replace `yourdomain.com.br` with your real domain everywhere

## 1. Add domain to Cloudflare

1. Sign up / log in at [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Add a site** → enter `yourdomain.com.br`
3. Select **Free** plan
4. Cloudflare scans existing DNS (optional) → continue
5. Copy the **two nameservers** shown (e.g. `ada.ns.cloudflare.com`, `bob.ns.cloudflare.com`)

## 2. Point Registro.br to Cloudflare

1. Log in at [registro.br](https://registro.br) → **Meus domínios**
2. Open your domain → **DNS** or **Alterar servidores DNS**
3. Choose **Usar servidores de nomes personalizados** (custom nameservers)
4. Remove Registro.br default NS; add Cloudflare's two nameservers exactly
5. Save — propagation can take **15 minutes to 48 hours** (usually &lt; 2 h)

Registro.br does **not** host your A records once NS point to Cloudflare. All DNS is managed in Cloudflare.

## 3. DNS records in Cloudflare

**DNS** → **Records**:

| Type | Name | IPv4 address | Proxy status |
|------|------|--------------|--------------|
| A | `@` | `72.60.147.2` | Proxied (orange cloud) |
| A | `www` | `72.60.147.2` | Proxied |
| A | `admin` | `72.60.147.2` | Proxied |

Optional (email — only if you use Google Workspace etc.):

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| MX | `@` | per provider | DNS only (grey) |

**TTL:** Auto when proxied.

## 4. SSL/TLS mode

1. **SSL/TLS** → Overview
2. Before certbot: **Flexible** (temporary) OR pause orange cloud (DNS only) until certs exist
3. After `certbot --nginx` on VPS: set **Full (strict)**

Cloudflare terminates client TLS; Nginx on VPS uses Let's Encrypt for origin TLS.

## 5. Recommended Cloudflare settings

| Section | Setting | Value |
|---------|---------|-------|
| SSL/TLS | Always Use HTTPS | On |
| SSL/TLS | Minimum TLS | 1.2 |
| Speed | Brotli | On |
| Caching | Browser Cache TTL | Respect Existing Headers |
| Security | Security Level | Medium |
| Network | WebSockets | On (if needed later) |

**Page Rules / Cache Rules:** do not cache `/api/*` — API sets its own `Cache-Control`.

Example cache rule: **Bypass** cache for URI Path starts with `/api/`.

## 6. Verify DNS

```bash
dig +short yourdomain.com.br
dig +short www.yourdomain.com.br
dig +short admin.yourdomain.com.br
```

Proxied records often return Cloudflare anycast IPs (not `72.60.147.2`) — that is expected.

```bash
curl -I https://yourdomain.com.br
curl -sS https://yourdomain.com.br/api/v1/categories | head
```

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| NXDOMAIN | Wait for Registro.br NS propagation; verify NS at Registro.br |
| 522 / connection timed out | UFW allows 80/443; Nginx running; correct A record |
| SSL handshake error | Set Cloudflare to Full (strict); rerun certbot |
| Redirect loop | Cloudflare SSL Flexible + Nginx HTTPS redirect — use Full (strict) |
| Admin CORS errors | `ADMIN_ORIGIN` in `api.env` must match `https://admin.yourdomain.com.br` |

## Related

- [vps-provisioning.md](vps-provisioning.md)
- [nginx.md](nginx.md)
- [deployment.md](deployment.md)
