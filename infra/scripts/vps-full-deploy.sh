#!/usr/bin/env bash
# Full VPS deploy after rsync — run on server: ./infra/scripts/vps-full-deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT}"

NGINX_HTTP_PORT=80
if [[ -f "${ROOT}/production/vps.env" ]]; then
  # shellcheck disable=SC1090
  source "${ROOT}/production/vps.env"
fi
NGINX_HTTP_PORT="${NGINX_HTTP_PORT:-80}"

echo "==> Repair docker.env if needed"
"${ROOT}/infra/scripts/repair-docker-env.sh" 2>/dev/null || true

echo "==> Data layer (Docker)"
"${ROOT}/infra/scripts/up-data-layer.sh"

echo "==> Install app env"
"${ROOT}/infra/scripts/install-env.sh"

echo "==> Clear stale tsbuildinfo (rsync excludes dist/)"
find "${ROOT}/packages" "${ROOT}/apps" -name '*.tsbuildinfo' -delete 2>/dev/null || true

echo "==> Deploy app"
export HUSKY=0
export CI=true
export SKIP_GIT_PULL=1
"${ROOT}/infra/scripts/deploy.sh"

echo "==> Hero 3D logo GLB (bundled asset — required for home viewer)"
"${ROOT}/infra/scripts/install-hero-logo-glb.sh"

if [[ "${RUN_VPS_SEED:-0}" == "1" ]]; then
  echo "==> Seed catalog + static assets (idempotent)"
  "${ROOT}/infra/scripts/vps-seed.sh"
else
  echo "vps-full-deploy.sh: skipping seed (pass --seed to deploy-to-vps.sh to enable)"
fi

echo "==> Nginx"
if [[ "${VPS_USE_HTTPS:-0}" == "1" ]]; then
  "${ROOT}/infra/scripts/install-nginx-domain.sh"
else
  "${ROOT}/infra/scripts/install-nginx-ip.sh"
fi

WEB_ASSET="$(find "${ROOT}/apps/web/dist/client/assets" -maxdepth 1 -name 'index-*.js' -print -quit 2>/dev/null || true)"
if [[ -z "${WEB_ASSET}" ]]; then
  echo "vps-full-deploy.sh: missing apps/web/dist/client/assets — web build failed?" >&2
  exit 1
fi
curl -sS -o /dev/null -w "Storefront asset: HTTP %{http_code}\n" \
  "http://127.0.0.1:${NGINX_HTTP_PORT}/assets/$(basename "${WEB_ASSET}")" || true
curl -sS -o /dev/null -w "Hero GLB: HTTP %{http_code}\n" \
  "http://127.0.0.1:${NGINX_HTTP_PORT}/models/3d/corvo-logo-preview.glb" || true

pm2 save

echo "==> Health check"
API_PORT="$(grep -E '^PORT=' "${ROOT}/apps/api/.env" | tail -1 | cut -d= -f2 | tr -d '\r' || echo 3101)"
curl -sS -o /dev/null -w "API local: HTTP %{http_code}\n" "http://127.0.0.1:${API_PORT}/api/v1/categories" || true
PUBLIC_HOST="${DOMAIN:-72.60.147.2}"
curl -sS -o /dev/null -w "API public: HTTP %{http_code}\n" "http://${PUBLIC_HOST}/api/v1/categories" || true

echo "vps-full-deploy.sh: done — check https://${PUBLIC_HOST} or http://${PUBLIC_HOST}"
