#!/usr/bin/env bash
# VPS health snapshot — run on server: ./infra/scripts/vps-diagnose.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT}"

API_PORT="3101"
if [[ -f "${ROOT}/apps/api/.env" ]]; then
  API_PORT="$(grep -E '^PORT=' "${ROOT}/apps/api/.env" | tail -1 | cut -d= -f2 | tr -d '\r' || echo 3101)"
fi

echo "========== PM2 =========="
pm2 status || true

echo "========== PORT ${API_PORT} (print3d API) =========="
ss -tlnp | grep ":${API_PORT}" || echo "nothing listening on ${API_PORT}"

echo "========== PORT 3001 (other app?) =========="
ss -tlnp | grep ':3001' || echo "nothing on 3001"

echo "========== API direct =========="
curl -sS -o /tmp/print3d-api.json -w "HTTP %{http_code}\n" "http://127.0.0.1:${API_PORT}/api/v1/categories" || true
head -c 200 /tmp/print3d-api.json 2>/dev/null; echo

echo "========== API via nginx =========="
curl -sS -o /tmp/print3d-nginx.json -w "HTTP %{http_code}\n" "http://127.0.0.1/api/v1/categories" -H "Host: 72.60.147.2" || true
head -c 200 /tmp/print3d-nginx.json 2>/dev/null; echo

echo "========== PM2 API logs (last 25) =========="
pm2 logs print3d-api --lines 25 --nostream 2>&1 || echo "print3d-api not in PM2"

echo "========== Docker =========="
docker compose -f infra/docker-compose.prod.yml --env-file production/env/docker.env ps 2>&1 || true

echo "========== nginx print3d-ip =========="
grep -E 'listen|server_name|127.0.0.1' /etc/nginx/sites-enabled/print3d-ip.conf 2>/dev/null | head -10 || echo "print3d-ip.conf not enabled"
