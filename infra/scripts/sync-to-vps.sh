#!/usr/bin/env bash
# Sync production secrets and optional code to VPS. See docs/infrastructure/vps-provisioning.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VPS_ENV="${ROOT}/production/vps.env"
SSH_KEY="${ROOT}/production/ssh/id_ed25519_print3d"

if [[ ! -f "${VPS_ENV}" ]]; then
  echo "sync-to-vps.sh: copy production/vps.env.example → production/vps.env" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "${VPS_ENV}"

: "${VPS_HOST:?set VPS_HOST in production/vps.env}"
: "${VPS_USER:?set VPS_USER}"
: "${VPS_PORT:=22}"
: "${VPS_APP_DIR:=/var/www/print3d}"

SSH_OPTS=(-p "${VPS_PORT}" -o StrictHostKeyChecking=accept-new)
if [[ -f "${SSH_KEY}" ]]; then
  SSH_OPTS+=(-i "${SSH_KEY}")
fi

REMOTE="${VPS_USER}@${VPS_HOST}"
RSYNC_SSH="ssh ${SSH_OPTS[*]}"

echo "==> Ensuring app directory on VPS"
ssh "${SSH_OPTS[@]}" "${REMOTE}" "mkdir -p ${VPS_APP_DIR}/production/env"

echo "==> Syncing production env (secrets only)"
rsync -avz -e "${RSYNC_SSH}" \
  "${ROOT}/production/env/api.env" \
  "${ROOT}/production/env/web.env.production" \
  "${ROOT}/production/env/admin.env" \
  "${REMOTE}:${VPS_APP_DIR}/production/env/"

if [[ -f "${ROOT}/production/env/docker.env" ]]; then
  rsync -avz -e "${RSYNC_SSH}" \
    "${ROOT}/production/env/docker.env" \
    "${REMOTE}:${VPS_APP_DIR}/production/env/"
fi

echo "==> Installing env into app paths on VPS"
ssh "${SSH_OPTS[@]}" "${REMOTE}" \
  "cd ${VPS_APP_DIR} && ./infra/scripts/install-env.sh"

echo "sync-to-vps.sh: secrets synced to ${REMOTE}:${VPS_APP_DIR}"
