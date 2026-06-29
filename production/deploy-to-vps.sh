#!/usr/bin/env bash
# One-command manual deploy: prepare prod env from dev + rsync repo + build on VPS.
# Usage:
#   ./production/deploy-to-vps.sh           # env + sync + remote deploy
#   ./production/deploy-to-vps.sh --env-only
# See production/README.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEV_ENV="${ROOT}/apps/api/.env"
VPS_ENV="${ROOT}/production/vps.env"
ENV_DIR="${ROOT}/production/env"
SSH_KEY="${ROOT}/production/ssh/id_ed25519_print3d"

# User phone (DDD 66) — same format as dev WHATSAPP_PHONE_NUMBER
WHATSAPP_PHONE="5566997227927"

MODE="${1:-all}"

read_env_val() {
  local file="$1"
  local key="$2"
  local fallback="${3:-}"
  [[ -f "${file}" ]] || { echo "${fallback}"; return; }
  local line
  line="$(grep -E "^${key}=" "${file}" | tail -1 || true)"
  [[ -n "${line}" ]] || { echo "${fallback}"; return; }
  echo "${line#*=}" | tr -d '\r'
}

prepare_production_env() {
  echo "==> Preparing production/env from dev settings"

  if [[ ! -f "${VPS_ENV}" ]]; then
    cp "${ROOT}/production/vps.env.example" "${VPS_ENV}"
    echo "deploy-to-vps.sh: edit production/vps.env (DOMAIN) then re-run" >&2
    exit 1
  fi

  # shellcheck disable=SC1090
  source "${VPS_ENV}"

  : "${VPS_HOST:?set VPS_HOST in production/vps.env}"
  DOMAIN="${DOMAIN:-yourdomain.com.br}"
  if [[ "${DOMAIN}" == "yourdomain.com.br" ]]; then
    echo "deploy-to-vps.sh: WARNING — set real DOMAIN in production/vps.env" >&2
  fi

  if [[ ! -f "${ENV_DIR}/docker.env" ]]; then
    "${ROOT}/infra/scripts/generate-secrets.sh"
  fi

  # shellcheck disable=SC1090
  source "${ENV_DIR}/docker.env"

  local admin_secret
  admin_secret="$(read_env_val "${ENV_DIR}/api.env" "ADMIN_SESSION_SECRET" "")"
  if [[ -z "${admin_secret}" || "${admin_secret}" == "CHANGE_ME_MIN_32_RANDOM_BYTES" ]]; then
    admin_secret="$(openssl rand -base64 32 | tr -d '\n/')"
  fi

  local base="https://${DOMAIN}"
  local admin_ttl idle_ttl upload_max
  admin_ttl="$(read_env_val "${DEV_ENV}" "ADMIN_SESSION_TTL" "28800")"
  idle_ttl="$(read_env_val "${DEV_ENV}" "ADMIN_SESSION_IDLE_TTL" "1800")"
  upload_max="$(read_env_val "${DEV_ENV}" "UPLOAD_MAX_BYTES" "5242880")"

  cat > "${ENV_DIR}/api.env" <<EOF
NODE_ENV=production
PORT=3001

DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:5432/${POSTGRES_DB}
REDIS_URL=redis://127.0.0.1:6379

WHATSAPP_PHONE_NUMBER=${WHATSAPP_PHONE}

CORS_ORIGIN=${base}
MODEL_FILES_BASE_PATH=/var/www/print3d/models
MODEL_FILES_BASE_URL=${base}/models

ADMIN_SESSION_SECRET=${admin_secret}
ADMIN_SESSION_TTL=${admin_ttl}
ADMIN_SESSION_IDLE_TTL=${idle_ttl}
ADMIN_ORIGIN=https://admin.${DOMAIN}

STORE_SESSION_TTL=2592000
STORE_SESSION_IDLE_TTL=604800

UPLOAD_MAX_BYTES=${upload_max}
MODEL_UPLOAD_MAX_BYTES=268435456
UPLOAD_DIR=/var/www/print3d/models

RABBITMQ_URL=amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@127.0.0.1:5672
MODEL_PROCESSING_QUEUE=model.processing
EOF

  cat > "${ENV_DIR}/web.env.production" <<EOF
VITE_API_BASE_URL=${base}/api/v1
VITE_ASSETS_BASE_URL=${base}
VITE_WHATSAPP_PHONE=${WHATSAPP_PHONE}
EOF

  cat > "${ENV_DIR}/admin.env" <<EOF
VITE_API_BASE_URL=${base}/api/v1
VITE_ASSETS_BASE_URL=${base}
VITE_WHATSAPP_PHONE=${WHATSAPP_PHONE}
EOF

  chmod 600 "${ENV_DIR}/"*.env
  echo "deploy-to-vps.sh: env ready (WhatsApp ${WHATSAPP_PHONE}, domain ${DOMAIN})"
}

ssh_opts() {
  SSH_OPTS=(-p "${VPS_PORT:-22}" -o StrictHostKeyChecking=accept-new)
  if [[ -f "${SSH_KEY}" ]]; then
    SSH_OPTS+=(-i "${SSH_KEY}")
  fi
}

sync_to_vps() {
  # shellcheck disable=SC1090
  source "${VPS_ENV}"
  : "${VPS_USER:?set VPS_USER}"
  VPS_APP_DIR="${VPS_APP_DIR:-/var/www/print3d}"
  REMOTE="${VPS_USER}@${VPS_HOST}"

  ssh_opts
  RSYNC_SSH="ssh ${SSH_OPTS[*]}"

  echo "==> Rsync project to ${REMOTE}:${VPS_APP_DIR}"
  rsync -avz --delete \
    -e "${RSYNC_SSH}" \
    --exclude node_modules \
    --exclude .turbo \
    --exclude dist \
    --exclude dist-ssr \
    --exclude .output \
    --exclude test-results \
    --exclude playwright-report \
    --exclude apps/api/storage \
    --exclude production/ssh/id_* \
    --exclude .git \
    "${ROOT}/" "${REMOTE}:${VPS_APP_DIR}/"

  echo "==> Rsync production secrets"
  ssh "${SSH_OPTS[@]}" "${REMOTE}" "mkdir -p ${VPS_APP_DIR}/production/env"
  rsync -avz -e "${RSYNC_SSH}" \
    "${ENV_DIR}/api.env" \
    "${ENV_DIR}/web.env.production" \
    "${ENV_DIR}/admin.env" \
    "${ENV_DIR}/docker.env" \
    "${REMOTE}:${VPS_APP_DIR}/production/env/"
}

remote_deploy() {
  # shellcheck disable=SC1090
  source "${VPS_ENV}"
  VPS_APP_DIR="${VPS_APP_DIR:-/var/www/print3d}"
  REMOTE="${VPS_USER}@${VPS_HOST}"
  DOMAIN="${DOMAIN:-yourdomain.com.br}"

  ssh_opts
  echo "==> Remote build and PM2 start"
  ssh "${SSH_OPTS[@]}" "${REMOTE}" bash -s <<REMOTE_SCRIPT
set -euo pipefail
cd "${VPS_APP_DIR}"
chmod +x infra/scripts/*.sh production/deploy-to-vps.sh 2>/dev/null || true
./infra/scripts/install-env.sh
docker compose -f infra/docker-compose.prod.yml --env-file production/env/docker.env up -d
mkdir -p models/{3d,thumbnails,images}
export SKIP_GIT_PULL=1
export DOMAIN="${DOMAIN}"
if pm2 describe print3d-api >/dev/null 2>&1; then
  ./infra/scripts/deploy.sh
else
  ./infra/scripts/first-deploy.sh
fi
REMOTE_SCRIPT

  echo "deploy-to-vps.sh: done — open https://${DOMAIN}"
}

main() {
  cd "${ROOT}"
  prepare_production_env
  [[ "${MODE}" == "--env-only" ]] && exit 0
  sync_to_vps
  remote_deploy
}

main "$@"
