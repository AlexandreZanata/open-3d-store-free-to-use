#!/usr/bin/env bash
# Install Node.js 22, pnpm 9, and PM2 on VPS when missing.
# See production/README.md
set -euo pipefail

need_node=0
need_pnpm=0
need_pm2=0

command -v node >/dev/null 2>&1 || need_node=1
command -v pnpm >/dev/null 2>&1 || need_pnpm=1
command -v pm2 >/dev/null 2>&1 || need_pm2=1

if [[ "${need_node}" == "0" && "${need_pnpm}" == "0" && "${need_pm2}" == "0" ]]; then
  echo "ensure-node.sh: node $(node -v), pnpm $(pnpm -v), pm2 OK"
  exit 0
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ensure-node.sh: run as root on VPS (or use sudo)" >&2
  exit 1
fi

if [[ "${need_node}" == "1" ]]; then
  echo "ensure-node.sh: installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

if [[ "${need_pnpm}" == "1" ]]; then
  echo "ensure-node.sh: installing pnpm 9"
  npm install -g pnpm@9
fi

if [[ "${need_pm2}" == "1" ]]; then
  echo "ensure-node.sh: installing PM2"
  npm install -g pm2
fi

echo "ensure-node.sh: node $(node -v), pnpm $(pnpm -v), pm2 ready"
