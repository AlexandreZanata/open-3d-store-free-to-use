#!/usr/bin/env bash
# Start production Docker data layer — see production/README.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT}/production/env/docker.env"
COMPOSE_FILE="${ROOT}/infra/docker-compose.prod.yml"

cd "${ROOT}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "up-data-layer.sh: missing ${ENV_FILE}" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "${ENV_FILE}"
if [[ -z "${POSTGRES_PASSWORD:-}" || "${POSTGRES_PASSWORD}" == "CHANGE_ME" ]]; then
  echo "up-data-layer.sh: repairing incomplete docker.env from api.env"
  "${ROOT}/infra/scripts/repair-docker-env.sh"
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi

if [[ -z "${POSTGRES_PASSWORD:-}" ]]; then
  echo "up-data-layer.sh: POSTGRES_PASSWORD missing — run repair-docker-env.sh or generate-secrets.sh" >&2
  exit 1
fi

docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --remove-orphans
docker compose -f "${COMPOSE_FILE}" ps

echo "up-data-layer.sh: data layer running"
