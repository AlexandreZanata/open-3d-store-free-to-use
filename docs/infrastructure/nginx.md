# Nginx Configuration

**File:** `infra/nginx/nginx.conf` → deploy to `/etc/nginx/sites-available/print3d.conf`

## Responsibilities

- HTTP → HTTPS redirect
- SSL termination (Let's Encrypt)
- Serve React static build from `/var/www/print3d/web`
- Serve `/models/` directly from filesystem (no Node proxy)
- Proxy `/api/` to `127.0.0.1:3001`
- SPA fallback: `try_files $uri $uri/ /index.html`

## Gzip types

```
text/plain text/css application/json application/javascript
application/wasm model/gltf-binary model/gltf+json
```

## Cache headers

| Location | TTL |
|----------|-----|
| `*.js`, `*.css`, images, fonts | 1 year, immutable |
| `/models/` | 30 days |
| `/api/` | Set by API (Cache-Control from Fastify) |

## API proxy headers

```
X-Real-IP, X-Forwarded-For, X-Forwarded-Proto, Host
proxy_read_timeout 30s
```

Full config template: see original spec section 5 in repo history or Phase 8 task references.

## Related documents

- [deployment.md](deployment.md)
- [../features/3d-viewer.md](../features/3d-viewer.md)
