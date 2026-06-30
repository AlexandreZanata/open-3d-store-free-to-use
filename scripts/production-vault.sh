#!/usr/bin/env bash
# Encrypt / decrypt local production secrets — production/vault/README.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VAULT_DIR="${ROOT}/production/vault"
ENCRYPTED_DIR="${VAULT_DIR}/encrypted"
IDENTITY="${PRODUCTION_VAULT_IDENTITY:-${VAULT_DIR}/identity.txt}"

SOURCES=(
  "production/vps.env"
  "production/env/api.env"
  "production/env/web.env.production"
  "production/env/admin.env"
  "production/env/docker.env"
)

require_age() {
  if ! command -v age >/dev/null 2>&1; then
    echo "production-vault.sh: install age (apt install age / brew install age)" >&2
    exit 1
  fi
}

recipient() {
  age-keygen -y "${IDENTITY}"
}

cmd_init() {
  require_age
  mkdir -p "${ENCRYPTED_DIR}"
  if [[ -f "${IDENTITY}" ]]; then
    echo "production-vault.sh: identity already exists at ${IDENTITY}" >&2
    exit 1
  fi
  age-keygen -o "${IDENTITY}"
  chmod 600 "${IDENTITY}"
  echo "Created ${IDENTITY} — back up offline; never commit."
}

encrypt_one() {
  local rel="$1"
  local src="${ROOT}/${rel}"
  local dest="${ENCRYPTED_DIR}/${rel}.age"
  if [[ ! -f "${src}" ]]; then
    return 0
  fi
  mkdir -p "$(dirname "${dest}")"
  age -r "$(recipient)" -o "${dest}" "${src}"
  echo "encrypted ${rel} → production/vault/encrypted/${rel}.age"
}

cmd_encrypt() {
  require_age
  [[ -f "${IDENTITY}" ]] || { echo "run: ./scripts/production-vault.sh init" >&2; exit 1; }
  mkdir -p "${ENCRYPTED_DIR}"
  local count=0
  for rel in "${SOURCES[@]}"; do
    if [[ -f "${ROOT}/${rel}" ]]; then
      encrypt_one "${rel}"
      count=$((count + 1))
    fi
  done
  shopt -s nullglob
  for key in "${ROOT}"/production/ssh/id_*; do
    [[ -f "${key}" ]] || continue
    [[ "${key}" == *.pub ]] && continue
    local rel="production/ssh/$(basename "${key}")"
    encrypt_one "${rel}"
    count=$((count + 1))
  done
  if [[ "${count}" -eq 0 ]]; then
    echo "production-vault.sh: no source files found to encrypt" >&2
    exit 1
  fi
}

decrypt_one() {
  local rel="$1"
  local src="${ENCRYPTED_DIR}/${rel}.age"
  local dest="${ROOT}/${rel}"
  if [[ ! -f "${src}" ]]; then
    return 0
  fi
  mkdir -p "$(dirname "${dest}")"
  age -d -i "${IDENTITY}" -o "${dest}" "${src}"
  chmod 600 "${dest}" 2>/dev/null || true
  echo "decrypted ${rel}"
}

cmd_decrypt() {
  require_age
  [[ -f "${IDENTITY}" ]] || { echo "missing ${IDENTITY}" >&2; exit 1; }
  for rel in "${SOURCES[@]}"; do
    decrypt_one "${rel}"
  done
  shopt -s nullglob
  for blob in "${ENCRYPTED_DIR}"/production/ssh/id_*.age; do
    [[ -f "${blob}" ]] || continue
    local base
    base="$(basename "${blob}" .age)"
    decrypt_one "production/ssh/${base}"
  done
}

usage() {
  echo "Usage: $0 init | encrypt | decrypt" >&2
  exit 1
}

case "${1:-}" in
  init) cmd_init ;;
  encrypt) cmd_encrypt ;;
  decrypt) cmd_decrypt ;;
  *) usage ;;
esac
