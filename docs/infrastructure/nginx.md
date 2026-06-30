# Nginx Configuration

**File:** `infra/nginx/nginx.conf` → deploy to `/etc/nginx/sites-available/print3d.conf`

## Responsibilities

- HTTP → HTTPS redirect
- SSL termination (Let's Encrypt)
- Proxy TanStack Start SSR (`127.0.0.1:4173`) for HTML document requests
- Serve `/assets/` and `/brand/` from `apps/web/dist/client/` (correct JS/WASM MIME; avoids SSR HTML fallback)
- Serve `/models/` directly from filesystem (no Node proxy)
- Proxy `/api/` to `127.0.0.1:3001`
- Long-cache immutable headers for proxied static assets (`*.js`, `*.css`, fonts, images)

## Upstreams

| Upstream | Target | Purpose |
|----------|--------|---------|
| `print3d_api` | `127.0.0.1:3001` | Fastify REST API |
| `print3d_web` | `127.0.0.1:4173` | TanStack Start SSR (`pnpm --filter @print3d/web start`) |
| `print3d_admin` | `127.0.0.1:4174` | Admin SPA (`pnpm --filter @print3d/admin preview`) |

Replace `yourdomain.com` in the template before enabling the site. Admin subdomain: `admin.yourdomain.com` — base path `/` (not `/admin/`). Nginx serves `admin.<domain>` `/assets/` from `apps/admin/dist/assets/`.

## Gzip types

```
text/plain text/css application/json application/javascript
application/wasm model/gltf-binary model/gltf+json
```

## Cache headers

| Location | TTL |
|----------|-----|
| `/assets/*` (filesystem under `apps/web/dist/client/assets/`) | 1 year, immutable |
| `/brand/*` (filesystem) | 7 days |
| `/models/` (filesystem, `^~` prefix) | 30 days |
| `/api/` | Set by API (Cache-Control from Fastify) |

## SSL bootstrap (first domain deploy)

`install-nginx-domain.sh` installs `nginx.domain-bootstrap.conf` (HTTP only) when
`/etc/letsencrypt/live/<domain>/fullchain.pem` is missing. Run
`complete-print3d-domain-ssl.sh` on the VPS (certbot + HTTPS template).

On a **shared VPS**, Cloudflare connects to origin port **443**. Until print3d has
its own SSL `server_name`, the other site's `default_server` block answers for
`corvo3d.com.br`. See [domain-go-live-corvo3d.md](domain-go-live-corvo3d.md).

Vite preview must allow the production hostname (`preview.allowedHosts` in
`apps/web/vite.config.ts`, derived from `VITE_ASSETS_BASE_URL`).

## API proxy headers

```
X-Real-IP, X-Forwarded-For, X-Forwarded-Proto, Host
client_max_body_size 256m   # matches admin model upload cap (docs/api/admin-contract.md)
proxy_read_timeout 300s     # large multipart uploads + inline model processing
proxy_send_timeout 300s
client_body_timeout 300s
```

**413 Request Entity Too Large** on admin model upload means nginx `client_max_body_size` is below the file size — redeploy `infra/nginx/nginx.conf` or `nginx.ip.conf` and run `sudo nginx -t && sudo systemctl reload nginx` on the VPS.

## Enable site

```bash
sudo cp infra/nginx/nginx.conf /etc/nginx/sites-available/print3d.conf
# edit server_name + SSL paths
sudo ln -s /etc/nginx/sites-available/print3d.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Full template: `infra/nginx/nginx.conf`

## Related documents

- [deployment.md](deployment.md)
- [../features/3d-viewer.md](../features/3d-viewer.md)
