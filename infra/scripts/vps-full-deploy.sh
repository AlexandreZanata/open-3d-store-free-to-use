#!/usr/bin/env bash
# Full VPS deploy after rsync — run on server: ./infra/scripts/vps-full-deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT}"

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

if [[ "${RUN_VPS_SEED:-0}" == "1" ]]; then
  echo "==> Seed catalog + static assets (idempotent)"
  "${ROOT}/infra/scripts/vps-seed.sh"
else
  echo "vps-full-deploy.sh: skipping seed (pass --seed to deploy-to-vps.sh to enable)"
fi

echo "==> Nginx IP site"
"${ROOT}/infra/scripts/install-nginx-ip.sh"

pm2 save

echo "==> Health check"
API_PORT="$(grep -E '^PORT=' "${ROOT}/apps/api/.env" | tail -1 | cut -d= -f2 | tr -d '\r' || echo 3101)"
curl -sS -o /dev/null -w "API local: HTTP %{http_code}\n" "http://127.0.0.1:${API_PORT}/api/v1/categories" || true
curl -sS -o /dev/null -w "API public: HTTP %{http_code}\n" http://72.60.147.2/api/v1/categories || true

echo "vps-full-deploy.sh: done — http://72.60.147.2"
