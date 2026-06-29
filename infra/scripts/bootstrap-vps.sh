#!/usr/bin/env bash
# First-time VPS bootstrap — run as root on the server.
# See docs/infrastructure/vps-provisioning.md
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/print3d}"
DOMAIN="${DOMAIN:-yourdomain.com.br}"
USE_DOCKER_DATA="${USE_DOCKER_DATA:-1}"

install_packages() {
  apt-get update
  apt-get install -y curl git nginx certbot python3-certbot-nginx ufw rsync
  if [[ "${USE_DOCKER_DATA}" == "1" ]]; then
    apt-get install -y docker.io docker-compose-v2
    systemctl enable --now docker
  else
    apt-get install -y postgresql-18 redis-server
    systemctl enable --now postgresql redis-server
  fi
}

install_node() {
  if command -v node >/dev/null 2>&1 && command -v pnpm >/dev/null 2>&1 && command -v pm2 >/dev/null 2>&1; then
    return
  fi
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  npm install -g pnpm@9 pm2
}

configure_firewall() {
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable
}

create_dirs() {
  mkdir -p "${APP_DIR}/models/"{3d,thumbnails,images}
  chown -R www-data:www-data "${APP_DIR}/models"
}

install_nginx() {
  local src="${APP_DIR}/infra/nginx/nginx.conf"
  local dst="/etc/nginx/sites-available/print3d.conf"
  if [[ ! -f "${src}" ]]; then
    echo "bootstrap-vps.sh: clone repo to ${APP_DIR} first" >&2
    exit 1
  fi
  sed "s/yourdomain.com/${DOMAIN}/g" "${src}" > "${dst}"
  ln -sf "${dst}" /etc/nginx/sites-enabled/print3d.conf
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
}

start_data_layer() {
  if [[ "${USE_DOCKER_DATA}" != "1" ]]; then
    return
  fi
  cd "${APP_DIR}"
  docker compose -f infra/docker-compose.prod.yml \
    --env-file production/env/docker.env up -d
}

main() {
  install_packages
  install_node
  configure_firewall
  create_dirs
  install_nginx
  start_data_layer
  echo "bootstrap-vps.sh: base stack ready — run install-env.sh then first-deploy.sh"
}

main "$@"
