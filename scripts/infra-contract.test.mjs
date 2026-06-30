import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, test } from "node:test";
import assert from "node:assert/strict";

/**
 * Contract: docs/infrastructure/deployment.md, docs/infrastructure/nginx.md,
 * docs/operations/ci-cd.md
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readRepo(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("deploy.sh contract — docs/infrastructure/deployment.md", () => {
  const script = readRepo("infra/scripts/deploy.sh");

  test("pulls code, installs, builds, migrates, and reloads PM2", () => {
    assert.match(script, /git pull --ff-only/);
    assert.match(script, /pnpm install --frozen-lockfile/);
    assert.match(script, /pnpm turbo build/);
    assert.match(script, /migrate\.sh/);
    assert.match(script, /pm2 reload/);
  });

  test("builds shared-types, whatsapp, api, web, and admin packages", () => {
    assert.match(script, /@print3d\/shared-types/);
    assert.match(script, /@print3d\/whatsapp/);
    assert.match(script, /@print3d\/api/);
    assert.match(script, /@print3d\/web/);
    assert.match(script, /@print3d\/admin/);
  });

  test("installs production env when production/env/api.env exists", () => {
    assert.match(script, /install-env\.sh/);
  });

  test("skips git pull for rsync deploy without .git", () => {
    assert.match(script, /SKIP_GIT_PULL/);
    assert.match(script, /\.git/);
  });

  test("installs with HUSKY=0 and NODE_ENV=development for VPS build", () => {
    assert.match(script, /HUSKY=0/);
    assert.match(script, /NODE_ENV=development pnpm install/);
  });
});

describe("migrate.sh contract — docs/infrastructure/deployment.md", () => {
  const script = readRepo("infra/scripts/migrate.sh");

  test("requires DATABASE_URL and runs drizzle-kit migrate", () => {
    assert.match(script, /DATABASE_URL/);
    assert.match(script, /drizzle-kit migrate/);
  });
});

describe("nginx.conf contract — docs/infrastructure/nginx.md", () => {
  const config = readRepo("infra/nginx/nginx.conf");

  test("redirects HTTP to HTTPS and terminates SSL", () => {
    assert.match(config, /listen 80/);
    assert.match(config, /return 301 https:\/\//);
    assert.match(config, /ssl_certificate/);
  });

  test("serves models from filesystem and proxies API, web, and admin", () => {
    assert.match(config, /location \^~ \/models\//);
    assert.match(config, /alias \/var\/www\/print3d\/models\//);
    assert.match(config, /location \^~ \/assets\//);
    assert.match(config, /apps\/web\/dist\/client\/assets\//);
    assert.match(config, /apps\/admin\/dist\/assets\//);
    assert.match(config, /location \/api\//);
    assert.match(config, /127\.0\.0\.1:3101/);
    assert.match(config, /127\.0\.0\.1:4173/);
    assert.match(config, /127\.0\.0\.1:4174/);
    assert.match(config, /admin\.yourdomain\.com/);
  });

  test("sets gzip types and cache headers per spec", () => {
    assert.match(config, /model\/gltf-binary/);
    assert.match(config, /max-age=2592000/);
    assert.match(config, /immutable/);
  });

  test("forwards proxy headers required by the API", () => {
    assert.match(config, /X-Real-IP/);
    assert.match(config, /X-Forwarded-For/);
    assert.match(config, /X-Forwarded-Proto/);
    assert.match(config, /client_max_body_size 256m/);
    assert.match(config, /proxy_read_timeout 300s/);
  });
});

describe("nginx.ip.conf contract — IP deploy /admin/ subpath", () => {
  const config = readRepo("infra/nginx/nginx.ip.conf");

  test("allows admin model uploads up to 256 MB", () => {
    assert.match(config, /client_max_body_size 256m/);
    assert.match(config, /proxy_read_timeout 300s/);
  });

  test("preserves /admin/ URI when proxying (no redirect loop)", () => {
    assert.match(config, /location \/admin\//);
    assert.match(config, /proxy_pass http:\/\/print3d_admin;/);
    assert.doesNotMatch(config, /proxy_pass http:\/\/print3d_admin\//);
  });
});

describe("pm2.ecosystem.config.example.js contract — docs/infrastructure/deployment.md", () => {
  const config = readRepo("infra/pm2.ecosystem.config.example.js");

  test("runs API cluster on main.js with production env", () => {
    assert.match(config, /print3d-api/);
    assert.match(config, /apps\/api\/dist\/main\.js/);
    assert.match(config, /node_args.*env-file.*apps\/api\/\.env/);
    assert.match(config, /PORT: 3101/);
    assert.match(config, /exec_mode: "cluster"/);
    assert.match(config, /instances: 2/);
    assert.match(config, /max_memory_restart: "900M"/);
  });

  test("runs TanStack Start web preview for SSR storefront", () => {
    assert.match(config, /print3d-web/);
    assert.match(config, /@print3d\/web start/);
  });

  test("runs admin SPA preview on port 4174", () => {
    assert.match(config, /print3d-admin/);
    assert.match(config, /@print3d\/admin preview/);
    assert.match(config, /max_memory_restart: "384M"/);
  });
});

describe("vps provisioning scripts — docs/infrastructure/vps-provisioning.md", () => {
  test("generate-secrets.sh creates env from examples", () => {
    const script = readRepo("infra/scripts/generate-secrets.sh");
    assert.match(script, /api\.env\.example/);
    assert.match(script, /openssl rand/);
  });

  test("docker-compose.prod.yml binds data services to localhost with alternate ports", () => {
    const compose = readRepo("infra/docker-compose.prod.yml");
    assert.match(compose, /POSTGRES_HOST_PORT:-5433/);
    assert.match(compose, /REDIS_HOST_PORT:-6380/);
    assert.match(compose, /postgres:18\.4-alpine/);
    assert.match(compose, /redis:8\.8-alpine/);
  });
});

describe("VPS rsync deploy — docs/infrastructure/deployment.md", () => {
  test("deploy-to-vps.sh seeds only with --seed", () => {
    const script = readRepo("production/deploy-to-vps.sh");
    assert.match(script, /--seed/);
    assert.match(script, /RUN_VPS_SEED/);
    assert.match(script, /export RUN_VPS_SEED=\$\{RUN_VPS_SEED\}/);
    assert.doesNotMatch(script, /SKIP_VPS_SEED/);
  });

  test("deploy-to-vps.sh rsync excludes server-side models tree", () => {
    const script = readRepo("production/deploy-to-vps.sh");
    assert.match(script, /--exclude models/);
  });

  test("nginx.ip.conf serves hashed web assets from dist/client", () => {
    const conf = readRepo("infra/nginx/nginx.ip.conf");
    assert.match(conf, /location \^~ \/assets\//);
    assert.match(conf, /apps\/web\/dist\/client\/assets\//);
  });

  test("vps-full-deploy.sh runs vps-seed.sh only when RUN_VPS_SEED=1", () => {
    const script = readRepo("infra/scripts/vps-full-deploy.sh");
    assert.match(script, /RUN_VPS_SEED/);
    assert.match(script, /vps-seed\.sh/);
    assert.match(script, /install-hero-logo-glb\.sh/);
    assert.doesNotMatch(script, /SKIP_VPS_SEED/);
  });

  test("vps-full-deploy.sh uses domain nginx when VPS_USE_HTTPS=1", () => {
    const script = readRepo("infra/scripts/vps-full-deploy.sh");
    assert.match(script, /VPS_USE_HTTPS/);
    assert.match(script, /install-nginx-domain\.sh/);
    assert.match(script, /install-nginx-ip\.sh/);
  });

  test("install-nginx-domain.sh uses HTTP bootstrap when certs are missing", () => {
    const script = readRepo("infra/scripts/install-nginx-domain.sh");
    assert.match(script, /nginx\.domain-bootstrap\.conf/);
    assert.match(script, /letsencrypt\/live/);
  });

  test("complete-print3d-domain-ssl.sh runs certbot then HTTPS template", () => {
    const script = readRepo("infra/scripts/complete-print3d-domain-ssl.sh");
    assert.match(script, /certbot --nginx/);
    assert.match(script, /install-nginx-domain\.sh/);
    assert.match(script, /admin_dns_ready/);
  });

  test("deploy-to-vps.sh sets VITE_INSTAGRAM_URL for storefront build", () => {
    const script = readRepo("production/deploy-to-vps.sh");
    assert.match(script, /VITE_INSTAGRAM_URL/);
  });

  test("deploy-to-vps.sh sets VITE_ADMIN_PUBLIC_HOST in domain HTTPS mode", () => {
    const script = readRepo("production/deploy-to-vps.sh");
    assert.match(script, /VITE_ADMIN_PUBLIC_HOST=admin\.\$\{DOMAIN\}/);
    assert.match(script, /admin_api_base="\/api\/v1"/);
  });
});

describe("domain go-live docs — docs/infrastructure/domain-go-live-corvo3d.md", () => {
  const guide = readRepo("docs/infrastructure/domain-go-live-corvo3d.md");

  test("documents Cloudflare admin DNS and certbot NXDOMAIN", () => {
    assert.match(guide, /admin\.corvo3d\.com\.br/);
    assert.match(guide, /NXDOMAIN/);
    assert.match(guide, /complete-print3d-domain-ssl\.sh/);
  });

  test("documents common multi-site and VPS_HOST mistakes", () => {
    assert.match(guide, /YOUR_VPS_IP/);
    assert.match(guide, /default_server/);
    assert.match(guide, /VITE_ADMIN_PUBLIC_HOST/);
    assert.match(guide, /admin\.corvo3d\.com\.br is not allowed/);
  });
});

describe("ci.yml contract — docs/operations/ci-cd.md", () => {
  const workflow = readRepo(".github/workflows/ci.yml");

  test("runs quality gate with Postgres 18.4 and Redis 8.8", () => {
    assert.match(workflow, /postgres:18\.4/);
    assert.match(workflow, /redis:8\.8/);
    assert.match(workflow, /quality-gate\.sh ci/);
  });

  test("runs e2e after tests and deploys on main push", () => {
    assert.match(workflow, /e2e:/);
    assert.match(workflow, /pnpm e2e/);
    assert.match(workflow, /deploy:/);
    assert.match(workflow, /VPS_HOST/);
    assert.match(workflow, /deploy\.sh/);
  });
});
