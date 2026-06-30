#!/usr/bin/env bash
# Populate catalog, thumbnails, and shop settings on VPS (run once after migrate).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT}/apps/api/.env"
MODELS_DIR="${ROOT}/models"
SEED_SOURCE="${SEED_MODELS_SOURCE_DIR:-${ROOT}/seed-models}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "vps-seed.sh: missing ${ENV_FILE} — run install-env.sh first" >&2
  exit 1
fi

mkdir -p "${MODELS_DIR}" "${SEED_SOURCE}"

echo "==> Hero 3D logo (bundled GLB, no STL required)"
"${ROOT}/infra/scripts/install-hero-logo-glb.sh" || true

if [[ -z "$(find "${SEED_SOURCE}" -maxdepth 1 -type f \( -name '*.stl' -o -name '*.3mf' \) 2>/dev/null | head -1)" ]]; then
  echo "vps-seed.sh: no STL/3MF in ${SEED_SOURCE} (product previews skipped)"
  echo "  Optional: ./production/sync-models-to-vps.sh from your PC"
fi

echo "==> Seeding database + static assets"
cd "${ROOT}/apps/api"
export SEED_MODELS_SOURCE_DIR="${SEED_SOURCE}"
export HUSKY=0
pnpm run db:seed

echo "==> Verify"
API_PORT="$(grep -E '^PORT=' "${ENV_FILE}" | tail -1 | cut -d= -f2 | tr -d '\r' || echo 3101)"
curl -sS "http://127.0.0.1:${API_PORT}/api/v1/categories" | head -c 120
echo
if [[ -f "${MODELS_DIR}/3d/corvo-logo-preview.glb" ]]; then
  echo "vps-seed.sh: hero GLB OK — $(wc -c < "${MODELS_DIR}/3d/corvo-logo-preview.glb") bytes"
else
  echo "vps-seed.sh: hero GLB missing — sync apps/api/seed-assets/hero/ from your PC" >&2
fi

echo "vps-seed.sh: done"
