#!/usr/bin/env bash
# Production deploy — see docs/infrastructure/deployment.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT}/apps/api/.env"
WEB_ENV="${ROOT}/apps/web/.env.production"
ADMIN_ENV="${ROOT}/apps/admin/.env.production"

cd "${ROOT}"

if [[ -f "${ROOT}/production/env/api.env" && ! -f "${ENV_FILE}" ]]; then
  "${ROOT}/infra/scripts/install-env.sh"
fi

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

load_vite_env() {
  local file="$1"
  [[ -f "${file}" ]] || return 0
  set -a
  # shellcheck disable=SC1090
  source "${file}"
  set +a
}

load_vite_env "${WEB_ENV}"
load_vite_env "${ADMIN_ENV}"

export VITE_API_BASE_URL="${VITE_API_BASE_URL:-${CORS_ORIGIN:-}/api/v1}"
export VITE_ASSETS_BASE_URL="${VITE_ASSETS_BASE_URL:-${CORS_ORIGIN:-}}"
export VITE_WHATSAPP_PHONE="${VITE_WHATSAPP_PHONE:-${WHATSAPP_PHONE_NUMBER:-}}"

if [[ -z "${VITE_API_BASE_URL}" || "${VITE_API_BASE_URL}" == "/api/v1" ]]; then
  echo "deploy.sh: set CORS_ORIGIN or VITE_API_BASE_URL in apps/api/.env" >&2
  exit 1
fi

if [[ "${SKIP_GIT_PULL:-}" != "1" ]]; then
  echo "==> Pulling latest code"
  git pull --ff-only
else
  echo "deploy.sh: SKIP_GIT_PULL=1 — using synced tree"
fi

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building packages"
pnpm turbo build \
  --filter=@print3d/shared-types \
  --filter=@print3d/whatsapp \
  --filter=@print3d/api \
  --filter=@print3d/web \
  --filter=@print3d/admin

echo "==> Running database migrations"
"${ROOT}/infra/scripts/migrate.sh"

echo "==> Reloading PM2 processes"
if pm2 describe print3d-api >/dev/null 2>&1; then
  pm2 reload "${ROOT}/infra/pm2.ecosystem.config.js" --env production --update-env
else
  pm2 start "${ROOT}/infra/pm2.ecosystem.config.js" --env production
  pm2 save
fi

echo "deploy.sh: deploy finished successfully"
