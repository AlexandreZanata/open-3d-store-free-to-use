#!/usr/bin/env bash
# Production deploy — see docs/infrastructure/deployment.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT}/apps/api/.env"

cd "${ROOT}"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

export VITE_API_BASE_URL="${VITE_API_BASE_URL:-${CORS_ORIGIN:-}/api/v1}"
export VITE_ASSETS_BASE_URL="${VITE_ASSETS_BASE_URL:-${CORS_ORIGIN:-}}"

if [[ -z "${VITE_API_BASE_URL}" || "${VITE_API_BASE_URL}" == "/api/v1" ]]; then
  echo "deploy.sh: set CORS_ORIGIN or VITE_API_BASE_URL in apps/api/.env" >&2
  exit 1
fi

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building packages"
pnpm turbo build \
  --filter=@print3d/shared-types \
  --filter=@print3d/whatsapp \
  --filter=@print3d/api \
  --filter=@print3d/web

echo "==> Running database migrations"
"${ROOT}/infra/scripts/migrate.sh"

echo "==> Reloading PM2 processes"
pm2 reload "${ROOT}/infra/pm2.ecosystem.config.js" --env production --update-env

echo "deploy.sh: deploy finished successfully"
