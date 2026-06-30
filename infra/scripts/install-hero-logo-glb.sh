#!/usr/bin/env bash
# Copy bundled hero GLB to models/3d — no tsx required (VPS-safe).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="${ROOT}/apps/api/seed-assets/hero/corvo-logo-preview.glb"
MODELS_DIR="${ROOT}/models"
DEST_DIR="${MODELS_DIR}/3d"
DEST="${DEST_DIR}/corvo-logo-preview.glb"

if [[ ! -f "${SRC}" ]]; then
  echo "install-hero-logo-glb.sh: missing ${SRC}" >&2
  echo "  Sync repo from your PC (deploy) — file is in git under apps/api/seed-assets/hero/" >&2
  exit 1
fi

mkdir -p "${DEST_DIR}"
install -m 644 "${SRC}" "${DEST}"
echo "install-hero-logo-glb.sh: installed ${DEST} ($(wc -c < "${DEST}") bytes)"
