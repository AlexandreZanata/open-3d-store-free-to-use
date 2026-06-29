#!/usr/bin/env bash
# Enable HTTP nginx site for VPS IP access — see infra/nginx/nginx.ip.conf
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VPS_ENV="${ROOT}/production/vps.env"

if [[ -f "${VPS_ENV}" ]]; then
  # shellcheck disable=SC1090
  source "${VPS_ENV}"
fi

VPS_IP="${DOMAIN:-${VPS_HOST:-72.60.147.2}}"
NGINX_HTTP_PORT="${NGINX_HTTP_PORT:-80}"
APP_DIR="${VPS_APP_DIR:-/var/www/print3d}"
src="${APP_DIR}/infra/nginx/nginx.ip.conf"
dst="/etc/nginx/sites-available/print3d-ip.conf"

sed \
  -e "s/YOUR_VPS_IP/${VPS_IP}/g" \
  -e "s/NGINX_HTTP_PORT/${NGINX_HTTP_PORT}/g" \
  "${src}" > "${dst}"

ln -sf "${dst}" /etc/nginx/sites-enabled/print3d-ip.conf
nginx -t
systemctl reload nginx

echo "install-nginx-ip.sh: http://${VPS_IP}:${NGINX_HTTP_PORT}/ (admin /admin/)"
