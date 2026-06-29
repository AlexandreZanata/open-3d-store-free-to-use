#!/usr/bin/env bash
# Rebuild production/env/docker.env from api.env when passwords or keys are missing.
# See production/README.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_ENV="${ROOT}/production/env/api.env"
DOCKER_ENV="${ROOT}/production/env/docker.env"

read_api_val() {
  local key="$1"
  grep -E "^${key}=" "${API_ENV}" | tail -1 | cut -d= -f2- | tr -d '\r'
}

parse_url_password() {
  local url="$1"
  echo "${url}" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p'
}

if [[ ! -f "${API_ENV}" ]]; then
  echo "repair-docker-env.sh: missing ${API_ENV}" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "${API_ENV}" 2>/dev/null || true

DB_URL="$(read_api_val DATABASE_URL)"
RMQ_URL="$(read_api_val RABBITMQ_URL)"
PG_PASS="$(parse_url_password "${DB_URL}")"
RMQ_PASS="$(parse_url_password "${RMQ_URL}")"

if [[ -z "${PG_PASS}" || -z "${RMQ_PASS}" ]]; then
  echo "repair-docker-env.sh: could not parse passwords from api.env" >&2
  exit 1
fi

# Preserve host ports if already set
POSTGRES_HOST_PORT="5433"
REDIS_HOST_PORT="6380"
RABBITMQ_HOST_PORT="5673"
RABBITMQ_MGMT_HOST_PORT="15673"
if [[ -f "${DOCKER_ENV}" ]]; then
  # shellcheck disable=SC1090
  source "${DOCKER_ENV}" 2>/dev/null || true
fi

cat > "${DOCKER_ENV}" <<EOF
POSTGRES_DB=print3d_prod
POSTGRES_USER=print3d
POSTGRES_PASSWORD=${PG_PASS}
POSTGRES_HOST_PORT=${POSTGRES_HOST_PORT:-5433}
REDIS_HOST_PORT=${REDIS_HOST_PORT:-6380}
RABBITMQ_USER=print3d
RABBITMQ_PASSWORD=${RMQ_PASS}
RABBITMQ_HOST_PORT=${RABBITMQ_HOST_PORT:-5673}
RABBITMQ_MGMT_HOST_PORT=${RABBITMQ_MGMT_HOST_PORT:-15673}
EOF

chmod 600 "${DOCKER_ENV}"
echo "repair-docker-env.sh: wrote ${DOCKER_ENV}"
