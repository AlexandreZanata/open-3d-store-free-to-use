#!/usr/bin/env bash
# Print nginx vhost routing — run on VPS to debug multi-domain issues.
set -euo pipefail

echo "==> sites-enabled"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || true

echo ""
echo "==> listen + server_name + default_server"
nginx -T 2>/dev/null | grep -E "# configuration file|listen |server_name |default_server" | head -120 || nginx -t

echo ""
echo "==> print3d vhost"
if [[ -f /etc/nginx/sites-enabled/print3d.conf ]]; then
  grep -E "listen|server_name|ssl_certificate" /etc/nginx/sites-enabled/print3d.conf || true
else
  echo "MISSING: /etc/nginx/sites-enabled/print3d.conf — run install-nginx-domain.sh"
fi

echo ""
echo "==> origin smoke (Host header)"
for host in corvo3d.com.br admin.corvo3d.com.br casamentovitoriaejoao.net.br; do
  code80="$(curl -sS -o /dev/null -w '%{http_code}' -H "Host: ${host}" http://127.0.0.1/ || echo err)"
  code443="$(curl -sk -o /dev/null -w '%{http_code}' -H "Host: ${host}" https://127.0.0.1/ || echo err)"
  echo "${host}: http=${code80} https=${code443}"
done

echo ""
echo "==> print3d API local"
curl -sS -o /dev/null -w "API 127.0.0.1:3101 → %{http_code}\n" http://127.0.0.1:3101/api/v1/categories || true
