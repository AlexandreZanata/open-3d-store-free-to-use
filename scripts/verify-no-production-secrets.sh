#!/usr/bin/env bash
# Block plaintext production secrets from git — run before push
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

FAIL=0

check_not_tracked() {
  local path="$1"
  local label="$2"
  if git ls-files --error-unmatch "${path}" >/dev/null 2>&1; then
    echo "verify-no-production-secrets: TRACKED ${label} — remove from git" >&2
    FAIL=1
  fi
}

for f in production/vps.env production/env/api.env production/env/web.env.production \
  production/env/admin.env production/env/docker.env production/vault/identity.txt \
  infra/pm2.ecosystem.config.js; do
  check_not_tracked "${f}" "${f}"
done

while IFS= read -r f; do
  check_not_tracked "${f}" "${f}"
done < <(git ls-files "production/ssh/" 2>/dev/null | grep -v '\.pub$' | grep -E 'id_|id_ed25519' || true)

STAGED="$(git diff --cached --name-only 2>/dev/null || true)"
for f in ${STAGED}; do
  case "${f}" in
    production/vps.env|production/env/api.env|production/env/web.env.production|\
    production/env/admin.env|production/env/docker.env|production/vault/identity.txt|\
    infra/pm2.ecosystem.config.js|production/ssh/id_*)
      echo "verify-no-production-secrets: staged forbidden file ${f}" >&2
      FAIL=1
      ;;
  esac
done

if [[ "${FAIL}" -ne 0 ]]; then
  exit 1
fi

echo "verify-no-production-secrets: OK"
