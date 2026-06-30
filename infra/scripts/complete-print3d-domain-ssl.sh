#!/usr/bin/env bash
# Finish corvo3d.com.br HTTPS on a shared VPS (HTTP bootstrap → certbot → HTTPS template).
# Run on VPS as root after deploy. Does not modify other sites' configs.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT}"

# shellcheck disable=SC1090
source "${ROOT}/production/vps.env"

DOMAIN="${DOMAIN:-corvo3d.com.br}"
cert_path="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

echo "==> Step 1: HTTP bootstrap vhost for ${DOMAIN}"
"${ROOT}/infra/scripts/install-nginx-domain.sh"

if [[ ! -f "${cert_path}" ]]; then
  echo "==> Step 2: Let's Encrypt (interactive — use your email)"
  certbot --nginx \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}" \
    -d "admin.${DOMAIN}"
else
  echo "==> Step 2: cert already at ${cert_path}"
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
echo "  Admin:  https://admin.${DOMAIN}"
echo "  Cloudflare → SSL/TLS → Full (strict)"
