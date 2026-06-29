#!/usr/bin/env bash
# Generate production secrets into production/env/ from *.example templates.
# See production/README.md and docs/infrastructure/vps-provisioning.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_DIR="${ROOT}/production/env"

random_hex() {
  openssl rand -hex "${1}"
}

random_b64() {
  openssl rand -base64 "${1}" | tr -d '\n/'
}

replace_once() {
  local file="$1"
  local needle="$2"
  local value="$3"
  if grep -q "${needle}" "${file}"; then
    sed -i "s|${needle}|${value}|g" "${file}"
  fi
}

copy_if_missing() {
  local src="$1"
  local dst="$2"
  if [[ -f "${dst}" ]]; then
    echo "generate-secrets.sh: keep existing ${dst}"
    return
  fi
  cp "${src}" "${dst}"
  echo "generate-secrets.sh: created ${dst}"
}

cd "${ROOT}"

copy_if_missing "${ENV_DIR}/api.env.example" "${ENV_DIR}/api.env"
copy_if_missing "${ENV_DIR}/web.env.production.example" "${ENV_DIR}/web.env.production"
copy_if_missing "${ENV_DIR}/admin.env.example" "${ENV_DIR}/admin.env"
copy_if_missing "${ENV_DIR}/docker.env.example" "${ENV_DIR}/docker.env"
copy_if_missing "${ROOT}/production/vps.env.example" "${ROOT}/production/vps.env"

DB_PASS="$(random_hex 16)"
ADMIN_SECRET="$(random_b64 32)"
RABBIT_PASS="$(random_hex 12)"

replace_once "${ENV_DIR}/api.env" "CHANGE_ME_MIN_32_RANDOM_BYTES" "${ADMIN_SECRET}"
replace_once "${ENV_DIR}/api.env" "postgresql://print3d:CHANGE_ME@" "postgresql://print3d:${DB_PASS}@"
replace_once "${ENV_DIR}/api.env" "amqp://print3d:CHANGE_ME@" "amqp://print3d:${RABBIT_PASS}@"
replace_once "${ENV_DIR}/docker.env" "POSTGRES_PASSWORD=CHANGE_ME" "POSTGRES_PASSWORD=${DB_PASS}"
replace_once "${ENV_DIR}/docker.env" "RABBITMQ_PASSWORD=CHANGE_ME" "RABBITMQ_PASSWORD=${RABBIT_PASS}"

chmod 600 "${ENV_DIR}/"*.env 2>/dev/null || true
chmod 600 "${ROOT}/production/vps.env" 2>/dev/null || true

echo "generate-secrets.sh: done — edit DOMAIN and WhatsApp in production/env/*.env"
