#!/usr/bin/env bash
# Switch production/vps.env from IP mode to real domain.
# Usage:
#   ./production/switch-to-domain.sh yourdomain.com.br
#   ./production/switch-to-domain.sh yourdomain.com.br --env-only
# See production/DNS-CUTOVER.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOMAIN="${1:-}"
DEPLOY_MODE="all"

if [[ -z "${DOMAIN}" ]]; then
  echo "switch-to-domain.sh: usage: $0 yourdomain.com.br [--env-only]" >&2
  exit 1
fi

if [[ "${2:-}" == "--env-only" ]]; then
  DEPLOY_MODE="--env-only"
fi

VPS_HOST="72.60.147.2"
VPS_USER="root"
VPS_PORT="22"
VPS_APP_DIR="/var/www/print3d"

if [[ -f "${ROOT}/production/vps.env" ]]; then
  # shellcheck disable=SC1090
  source "${ROOT}/production/vps.env"
fi

cat > "${ROOT}/production/vps.env" <<EOF
# Domain mode — see production/DNS-CUTOVER.md
VPS_HOST=${VPS_HOST}
VPS_USER=${VPS_USER}
VPS_PORT=${VPS_PORT}
VPS_APP_DIR=${VPS_APP_DIR}

DOMAIN=${DOMAIN}
VPS_USE_HTTPS=1
NGINX_HTTP_PORT=80
EOF

chmod 600 "${ROOT}/production/vps.env"
echo "switch-to-domain.sh: vps.env updated (DOMAIN=${DOMAIN}, HTTPS=1)"

if [[ "${DEPLOY_MODE}" == "--env-only" ]]; then
  "${ROOT}/production/deploy-to-vps.sh" --env-only
else
  "${ROOT}/production/deploy-to-vps.sh"
fi
