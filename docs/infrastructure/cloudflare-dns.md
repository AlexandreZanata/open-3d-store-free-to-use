# Cloudflare + Registro.br DNS

> Publish the VPS (`YOUR_VPS_IP`) behind Cloudflare proxy with HTTPS.
>
> **Example domain:** `corvo3d.com.br` — live storefront for this project.

## Prerequisites

- Domain registered at [Registro.br](https://registro.br) (e.g. **corvo3d.com.br**)
- VPS running Nginx on ports 80/443 (see [vps-provisioning.md](vps-provisioning.md))
- Shared VPS: [shared-vps-multi-domain.md](shared-vps-multi-domain.md)

## 1. Add domain to Cloudflare

1. Sign up / log in at [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Add a site** → enter `corvo3d.com.br` (or your domain)
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

**Production cutover checklist (when NS are active):** [../../production/DNS-CUTOVER.md](../../production/DNS-CUTOVER.md)

## 3. DNS records in Cloudflare

**DNS** → **Records**:

| Type | Name | IPv4 address | Proxy status |
|------|------|--------------|--------------|
| A | `@` | `YOUR_VPS_IP` | Proxied (orange cloud) |
| A | `www` | `YOUR_VPS_IP` | Proxied |
| A | `admin` | `YOUR_VPS_IP` | Proxied |

**corvo3d.com.br:** admin panel is `https://admin.corvo3d.com.br` — the `admin` A record is required.

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
dig +short corvo3d.com.br
dig +short www.corvo3d.com.br
dig +short admin.corvo3d.com.br
```

Proxied records often return Cloudflare anycast IPs (not `YOUR_VPS_IP`) — that is expected.

```bash
curl -I https://corvo3d.com.br
curl -sS https://corvo3d.com.br/api/v1/categories | head
```

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| NXDOMAIN | Wait for Registro.br NS propagation; verify NS at Registro.br |
| `NXDOMAIN … admin.<domain>` | Add Cloudflare **A** record `admin` → VPS IP before certbot |
| 522 / connection timed out | UFW allows 80/443; Nginx running; correct A record |
| SSL handshake error | Set Cloudflare to Full (strict); rerun certbot |
| Redirect loop | Cloudflare SSL Flexible + Nginx HTTPS redirect — use Full (strict) |
| Admin CORS errors | `ADMIN_ORIGIN` in `api.env` must match `https://admin.yourdomain.com.br` |
| Wrong site on new domain | Finish origin HTTPS for print3d — [domain-go-live-corvo3d.md](domain-go-live-corvo3d.md#common-errors) |

**Full operator guide:** [domain-go-live-corvo3d.md](domain-go-live-corvo3d.md)

## Related

- [vps-provisioning.md](vps-provisioning.md)
- [nginx.md](nginx.md)
- [deployment.md](deployment.md)
