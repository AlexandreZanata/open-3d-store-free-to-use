# Nginx Configuration

**File:** `infra/nginx/nginx.conf` → deploy to `/etc/nginx/sites-available/print3d.conf`

## Responsibilities

- HTTP → HTTPS redirect
- SSL termination (Let's Encrypt)
- Proxy TanStack Start SSR (`127.0.0.1:4173`) for storefront routes and hashed assets
- Serve `/models/` directly from filesystem (no Node proxy)
- Proxy `/api/` to `127.0.0.1:3001`
- Long-cache immutable headers for proxied static assets (`*.js`, `*.css`, fonts, images)

## Upstreams

| Upstream | Target | Purpose |
|----------|--------|---------|
| `print3d_api` | `127.0.0.1:3001` | Fastify REST API |
| `print3d_web` | `127.0.0.1:4173` | TanStack Start SSR (`pnpm --filter @print3d/web start`) |
| `print3d_admin` | `127.0.0.1:4174` | Admin SPA (`pnpm --filter @print3d/admin preview`) |

Replace `yourdomain.com` in the template before enabling the site. Admin subdomain: `admin.yourdomain.com`.

## Gzip types

```
text/plain text/css application/json application/javascript
application/wasm model/gltf-binary model/gltf+json
```

## Cache headers

| Location | TTL |
|----------|-----|
| Proxied `*.js`, `*.css`, images, fonts | 1 year, immutable |
| `/models/` | 30 days |
| `/api/` | Set by API (Cache-Control from Fastify) |

## API proxy headers

```
X-Real-IP, X-Forwarded-For, X-Forwarded-Proto, Host
proxy_read_timeout 30s
```

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
