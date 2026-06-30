#!/usr/bin/env bash
# One-command manual deploy: prepare prod env + rsync + build on VPS.
# Usage:
#   ./production/deploy-to-vps.sh              # env + sync + remote deploy (no seed)
#   ./production/deploy-to-vps.sh --seed       # same + catalog/db seed on VPS
#   ./production/deploy-to-vps.sh --env-only   # regenerate production/env only
# See production/README.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEV_ENV="${ROOT}/apps/api/.env"
VPS_ENV="${ROOT}/production/vps.env"
ENV_DIR="${ROOT}/production/env"

# User phone (DDD 66) — same format as dev WHATSAPP_PHONE_NUMBER
WHATSAPP_PHONE="5566997227927"

MODE="all"
RUN_VPS_SEED=0
for arg in "$@"; do
  case "${arg}" in
    --env-only) MODE="env-only" ;;
    --seed) RUN_VPS_SEED=1 ;;
    *)
      echo "deploy-to-vps.sh: unknown option ${arg} (use --env-only or --seed)" >&2
      exit 1
      ;;
  esac
done

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
  DOMAIN="${DOMAIN:-${VPS_HOST}}"
  VPS_USE_HTTPS="${VPS_USE_HTTPS:-0}"
  NGINX_HTTP_PORT="${NGINX_HTTP_PORT:-80}"

  if [[ "${DOMAIN}" == "yourdomain.com.br" ]]; then
    DOMAIN="${VPS_HOST}"
    VPS_USE_HTTPS=0
  fi

  local base admin_origin admin_base_path=""
  if [[ "${VPS_USE_HTTPS}" == "0" ]]; then
    if [[ "${NGINX_HTTP_PORT}" == "80" ]]; then
      base="http://${DOMAIN}"
    else
      base="http://${DOMAIN}:${NGINX_HTTP_PORT}"
    fi
    admin_origin="${base}/admin"
    admin_base_path="/admin"
  else
    base="https://${DOMAIN}"
    admin_origin="https://admin.${DOMAIN}"
  fi

  if [[ ! -f "${ENV_DIR}/docker.env" ]]; then
    "${ROOT}/infra/scripts/generate-secrets.sh"
  fi

  # shellcheck disable=SC1090
  source "${ENV_DIR}/docker.env"

  POSTGRES_HOST_PORT="${POSTGRES_HOST_PORT:-5433}"
  REDIS_HOST_PORT="${REDIS_HOST_PORT:-6380}"
  RABBITMQ_HOST_PORT="${RABBITMQ_HOST_PORT:-5673}"
  API_PORT="${API_PORT:-3101}"

  local admin_secret
  admin_secret="$(read_env_val "${ENV_DIR}/api.env" "ADMIN_SESSION_SECRET" "")"
  if [[ -z "${admin_secret}" || "${admin_secret}" == "CHANGE_ME_MIN_32_RANDOM_BYTES" ]]; then
    admin_secret="$(openssl rand -base64 32 | tr -d '\n/')"
  fi

  local admin_ttl idle_ttl upload_max
  admin_ttl="$(read_env_val "${DEV_ENV}" "ADMIN_SESSION_TTL" "28800")"
  idle_ttl="$(read_env_val "${DEV_ENV}" "ADMIN_SESSION_IDLE_TTL" "1800")"
  upload_max="$(read_env_val "${DEV_ENV}" "UPLOAD_MAX_BYTES" "5242880")"

  cat > "${ENV_DIR}/api.env" <<EOF
NODE_ENV=production
PORT=${API_PORT}

DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:${POSTGRES_HOST_PORT}/${POSTGRES_DB}
REDIS_URL=redis://127.0.0.1:${REDIS_HOST_PORT}

WHATSAPP_PHONE_NUMBER=${WHATSAPP_PHONE}

CORS_ORIGIN=${base}
MODEL_FILES_BASE_PATH=/var/www/print3d/models
MODEL_FILES_BASE_URL=${base}/models

ADMIN_SESSION_SECRET=${admin_secret}
ADMIN_SESSION_TTL=${admin_ttl}
ADMIN_SESSION_IDLE_TTL=${idle_ttl}
ADMIN_ORIGIN=${admin_origin}

STORE_SESSION_TTL=2592000
STORE_SESSION_IDLE_TTL=604800

UPLOAD_MAX_BYTES=${upload_max}
MODEL_UPLOAD_MAX_BYTES=268435456
UPLOAD_DIR=/var/www/print3d/models

RABBITMQ_URL=amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@127.0.0.1:${RABBITMQ_HOST_PORT}
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
${admin_base_path:+VITE_ADMIN_BASE_PATH=${admin_base_path}}
EOF

  chmod 600 "${ENV_DIR}/"*.env
  echo "deploy-to-vps.sh: env ready (${base}, WhatsApp ${WHATSAPP_PHONE})"
}

sync_and_deploy() {
  # shellcheck disable=SC1090
  source "${VPS_ENV}"
  : "${VPS_USER:?set VPS_USER}"
  VPS_APP_DIR="${VPS_APP_DIR:-/var/www/print3d}"

  # shellcheck disable=SC1091
  source "${ROOT}/infra/scripts/vps-ssh-common.sh"
  vps_ssh_begin "${ROOT}"

  echo "==> Open SSH session (enter password once if prompted)"
  ssh "${VPS_SSH_OPTS[@]}" "${VPS_REMOTE}" "mkdir -p '${VPS_APP_DIR}/production/env'"

  echo "==> Rsync project + production secrets to ${VPS_REMOTE}:${VPS_APP_DIR}"
  rsync -avz --delete \
    -e "${VPS_RSYNC_SSH}" \
    --exclude node_modules \
    --exclude .turbo \
    --exclude dist \
    --exclude '*.tsbuildinfo' \
    --exclude dist-ssr \
    --exclude .output \
    --exclude test-results \
    --exclude playwright-report \
    --exclude apps/api/storage \
    --exclude models \
    --exclude seed-models \
    --exclude production/ssh/id_* \
    --exclude .git \
    "${ROOT}/" "${VPS_REMOTE}:${VPS_APP_DIR}/"

  echo "==> Remote full deploy on VPS"
  ssh "${VPS_SSH_OPTS[@]}" "${VPS_REMOTE}" bash -s <<REMOTE_SCRIPT
set -euo pipefail
cd "${VPS_APP_DIR}"
export RUN_VPS_SEED=${RUN_VPS_SEED}
chmod +x infra/scripts/*.sh production/*.sh 2>/dev/null || true
./infra/scripts/vps-full-deploy.sh
REMOTE_SCRIPT

  local open_url="http://${DOMAIN}"
  [[ "${VPS_USE_HTTPS}" == "1" ]] && open_url="https://${DOMAIN}"
  [[ "${NGINX_HTTP_PORT:-80}" != "80" && "${VPS_USE_HTTPS}" == "0" ]] && open_url="${open_url}:${NGINX_HTTP_PORT}"
  echo "deploy-to-vps.sh: done — open ${open_url} (admin ${open_url}/admin/)"
}

main() {
  cd "${ROOT}"
  prepare_production_env
  [[ "${MODE}" == "env-only" ]] && exit 0
  sync_and_deploy
  if [[ "${RUN_VPS_SEED}" == "1" ]]; then
    echo "deploy-to-vps.sh: seed ran on VPS (--seed)"
  else
    echo "deploy-to-vps.sh: no seed (pass --seed to run vps-seed.sh)"
  fi
}

main "$@"
