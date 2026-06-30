#!/usr/bin/env bash
# Finish corvo3d.com.br HTTPS on a shared VPS (HTTP bootstrap → certbot → HTTPS template).
# Run on VPS as root after deploy. Does not modify other sites' configs.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT}"

# shellcheck disable=SC1090
source "${ROOT}/production/vps.env"

DOMAIN="${DOMAIN:-corvo3d.com.br}"
ADMIN_HOST="admin.${DOMAIN}"
cert_path="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

admin_dns_ready() {
  if command -v dig >/dev/null 2>&1; then
    dig +short A "${ADMIN_HOST}" | grep -qE '^[0-9.]+'
    return
  fi
  getent ahosts "${ADMIN_HOST}" >/dev/null 2>&1
}

build_certbot_domains() {
  CERTBOT_DOMAINS=(-d "${DOMAIN}" -d "www.${DOMAIN}")
  if admin_dns_ready; then
    CERTBOT_DOMAINS+=(-d "${ADMIN_HOST}")
    echo "complete-print3d-domain-ssl.sh: DNS OK for ${ADMIN_HOST}"
  else
    echo "complete-print3d-domain-ssl.sh: SKIP ${ADMIN_HOST} — no DNS A record yet" >&2
    echo "  Cloudflare → A record admin → YOUR_VPS_IP (Proxied), then re-run:" >&2
    echo "  certbot --nginx --expand -d ${DOMAIN} -d www.${DOMAIN} -d ${ADMIN_HOST}" >&2
  fi
}

echo "==> Step 1: HTTP bootstrap vhost for ${DOMAIN}"
"${ROOT}/infra/scripts/install-nginx-domain.sh"

if [[ ! -f "${cert_path}" ]]; then
  build_certbot_domains
  echo "==> Step 2: Let's Encrypt (interactive — use your email)"
  certbot --nginx "${CERTBOT_DOMAINS[@]}"
else
  echo "==> Step 2: cert already at ${cert_path}"
  if admin_dns_ready && ! openssl x509 -in "${cert_path}" -noout -text 2>/dev/null | grep -q "DNS:${ADMIN_HOST}"; then
    echo "==> Expanding cert to include ${ADMIN_HOST}"
    certbot --nginx --expand -d "${DOMAIN}" -d "www.${DOMAIN}" -d "${ADMIN_HOST}"
  fi
fi

echo "==> Step 3: HTTPS nginx template"
"${ROOT}/infra/scripts/install-nginx-domain.sh"

echo "==> Step 4: reload + smoke"
nginx -t
systemctl reload nginx
pm2 reload print3d-web print3d-admin --update-env || pm2 reload all

"${ROOT}/infra/scripts/diagnose-nginx-vhosts.sh"

echo ""
echo "complete-print3d-domain-ssl.sh: done"
echo "  Store:  https://${DOMAIN}"
if admin_dns_ready; then
  echo "  Admin:  https://${ADMIN_HOST}"
else
  echo "  Admin:  add DNS for ${ADMIN_HOST}, then certbot --expand"
fi
echo "  Cloudflare → SSL/TLS → Full (strict)"
