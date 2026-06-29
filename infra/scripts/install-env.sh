#!/usr/bin/env bash
# Copy production/env/* into app paths (local or VPS). See production/README.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="${ROOT}/production/env"

install_file() {
  local from="$1"
  local to="$2"
  if [[ ! -f "${from}" ]]; then
    echo "install-env.sh: missing ${from} — run generate-secrets.sh first" >&2
    exit 1
  fi
  install -m 600 "${from}" "${to}"
  echo "install-env.sh: installed ${to}"
}

install_file "${SRC}/api.env" "${ROOT}/apps/api/.env"
install_file "${SRC}/web.env.production" "${ROOT}/apps/web/.env.production"
install_file "${SRC}/admin.env" "${ROOT}/apps/admin/.env.production"

echo "install-env.sh: production env installed"
