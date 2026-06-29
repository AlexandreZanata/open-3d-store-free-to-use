#!/usr/bin/env bash
# Enable domain nginx site (HTTPS template) — run before or after certbot.
# See production/DNS-CUTOVER.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VPS_ENV="${ROOT}/production/vps.env"

if [[ -f "${VPS_ENV}" ]]; then
  # shellcheck disable=SC1090
  source "${VPS_ENV}"
fi

DOMAIN="${DOMAIN:-yourdomain.com.br}"
APP_DIR="${VPS_APP_DIR:-/var/www/print3d}"
src="${APP_DIR}/infra/nginx/nginx.conf"
dst="/etc/nginx/sites-available/print3d.conf"

if [[ "${DOMAIN}" == "yourdomain.com.br" ]] || [[ "${DOMAIN}" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "install-nginx-domain.sh: set real DOMAIN in production/vps.env" >&2
  exit 1
fi

sed "s/yourdomain.com/${DOMAIN}/g" "${src}" > "${dst}"
ln -sf "${dst}" /etc/nginx/sites-enabled/print3d.conf
rm -f /etc/nginx/sites-enabled/print3d-ip.conf
nginx -t
systemctl reload nginx

echo "install-nginx-domain.sh: enabled https://${DOMAIN} — run certbot if certs missing"
