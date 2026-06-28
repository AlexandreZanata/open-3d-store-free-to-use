#!/usr/bin/env bash
# Apply Drizzle migrations — see docs/infrastructure/deployment.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT}/apps/api/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "migrate.sh: DATABASE_URL is required (set in apps/api/.env)" >&2
  exit 1
fi

cd "${ROOT}/apps/api"
pnpm exec drizzle-kit migrate
echo "migrate.sh: migrations applied"
