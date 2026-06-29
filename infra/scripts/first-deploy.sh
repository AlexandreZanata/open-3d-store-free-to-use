#!/usr/bin/env bash
# Initial production start after bootstrap — run on VPS from repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT}"

"${ROOT}/infra/scripts/install-env.sh"

if [[ ! -d node_modules ]]; then
  pnpm install --frozen-lockfile
fi

pnpm turbo build \
  --filter=@print3d/shared-types \
  --filter=@print3d/whatsapp \
  --filter=@print3d/api \
  --filter=@print3d/web \
  --filter=@print3d/admin

"${ROOT}/infra/scripts/migrate.sh"

if pm2 describe print3d-api >/dev/null 2>&1; then
  pm2 reload "${ROOT}/infra/pm2.ecosystem.config.js" --env production --update-env
else
  pm2 start "${ROOT}/infra/pm2.ecosystem.config.js" --env production
  pm2 startup
  pm2 save
fi

echo "first-deploy.sh: site is up — verify https://${DOMAIN:-yourdomain}/ and run certbot if needed"
