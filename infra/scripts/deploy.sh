#!/usr/bin/env bash
# Production deploy — see docs/infrastructure/deployment.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT}/apps/api/.env"
WEB_ENV="${ROOT}/apps/web/.env.production"

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

export VITE_API_BASE_URL="${VITE_API_BASE_URL:-${CORS_ORIGIN:-}/api/v1}"
export VITE_ASSETS_BASE_URL="${VITE_ASSETS_BASE_URL:-${CORS_ORIGIN:-}}"
export VITE_WHATSAPP_PHONE="${VITE_WHATSAPP_PHONE:-${WHATSAPP_PHONE_NUMBER:-}}"

if [[ -z "${CORS_ORIGIN:-}" ]]; then
  echo "deploy.sh: set CORS_ORIGIN in apps/api/.env" >&2
  exit 1
fi

if [[ "${VITE_API_BASE_URL}" == "/api/v1" || ! "${VITE_API_BASE_URL}" =~ ^https?:// ]]; then
  echo "deploy.sh: storefront needs absolute VITE_API_BASE_URL (apps/web/.env.production or CORS_ORIGIN)" >&2
  exit 1
fi

# Admin build reads apps/admin/.env.production (relative /api/v1 on admin subdomain).
# Vite prefers process.env over .env files — build web and admin separately.

if [[ "${SKIP_GIT_PULL:-}" == "1" ]] || [[ ! -d "${ROOT}/.git" ]]; then
  echo "deploy.sh: skipping git pull (rsync deploy or SKIP_GIT_PULL=1)"
else
  echo "==> Pulling latest code"
  git pull --ff-only origin main
fi

echo "==> Checking Node.js / pnpm / PM2"
"${ROOT}/infra/scripts/ensure-node.sh"

echo "==> Installing dependencies"
export HUSKY=0
export CI=true
# Build needs devDependencies — api.env sets NODE_ENV=production
NODE_ENV=development pnpm install --frozen-lockfile

echo "==> Cleaning stale tsbuildinfo (rsync excludes dist/)"
find "${ROOT}/packages" "${ROOT}/apps" -name '*.tsbuildinfo' -delete 2>/dev/null || true

echo "==> Building packages"
NODE_ENV=development pnpm turbo build \
  --filter=@print3d/shared-types \
  --filter=@print3d/whatsapp \
  --filter=@print3d/api

# Vite bakes VITE_* at build time; install-env may have just changed .env.production.
# NODE_ENV=production — required so SSR bundle uses jsx() not jsxDEV (avoids HTTP 500).
echo "==> Building storefront (absolute VITE_* from web env)"
NODE_ENV=production pnpm turbo build --force \
  --filter=@print3d/web

echo "==> Building admin (unset storefront VITE_* — Vite prefers process.env)"
unset VITE_API_BASE_URL VITE_ASSETS_BASE_URL VITE_WHATSAPP_PHONE
NODE_ENV=production pnpm turbo build --force \
  --filter=@print3d/admin

echo "==> Running database migrations"
"${ROOT}/infra/scripts/migrate.sh"

if [[ "${SKIP_REOPTIMIZE_MODELS:-}" != "1" ]]; then
  echo "==> Regenerating storefront preview GLBs (upload orientation pipeline)"
  (cd "${ROOT}/apps/api" && pnpm run reoptimize-all-previews)
fi

echo "==> Reloading PM2 processes"
if pm2 describe print3d-api >/dev/null 2>&1; then
  pm2 reload "${ROOT}/infra/pm2.ecosystem.config.js" --env production --update-env
else
  pm2 start "${ROOT}/infra/pm2.ecosystem.config.js" --env production
  pm2 save
fi

echo "deploy.sh: deploy finished successfully"
