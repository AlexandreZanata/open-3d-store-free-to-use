#!/usr/bin/env bash
# Enable domain nginx site — HTTP bootstrap until certs exist, then HTTPS template.
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
dst="/etc/nginx/sites-available/print3d.conf"
cert_path="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

if [[ "${DOMAIN}" == "yourdomain.com.br" ]] || [[ "${DOMAIN}" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "install-nginx-domain.sh: set real DOMAIN in production/vps.env" >&2
  exit 1
fi

pick_template() {
  if [[ -f "${cert_path}" ]]; then
    echo "nginx.conf"
  else
    echo "nginx.domain-bootstrap.conf"
  fi
}

template="$(pick_template)"
src="${APP_DIR}/infra/nginx/${template}"

if [[ ! -f "${src}" ]]; then
  echo "install-nginx-domain.sh: missing ${src}" >&2
  exit 1
fi

sed "s/yourdomain.com/${DOMAIN}/g" "${src}" > "${dst}"
mkdir -p "${APP_DIR}/infra/nginx/acme-webroot"
ln -sf "${dst}" /etc/nginx/sites-enabled/print3d.conf
rm -f /etc/nginx/sites-enabled/print3d-ip.conf
nginx -t
systemctl reload nginx

if [[ "${template}" == "nginx.domain-bootstrap.conf" ]]; then
  echo "install-nginx-domain.sh: HTTP bootstrap for ${DOMAIN} — run certbot, then re-run this script"
  echo "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} -d admin.${DOMAIN}"
else
  echo "install-nginx-domain.sh: HTTPS enabled for https://${DOMAIN}"
fi
