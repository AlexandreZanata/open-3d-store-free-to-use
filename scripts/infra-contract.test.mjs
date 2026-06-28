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

  test("builds shared-types, whatsapp, api, and web packages", () => {
    assert.match(script, /@print3d\/shared-types/);
    assert.match(script, /@print3d\/whatsapp/);
    assert.match(script, /@print3d\/api/);
    assert.match(script, /@print3d\/web/);
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

  test("serves models from filesystem and proxies API and web", () => {
    assert.match(config, /location \/models\//);
    assert.match(config, /alias \/var\/www\/print3d\/models\//);
    assert.match(config, /location \/api\//);
    assert.match(config, /127\.0\.0\.1:3001/);
    assert.match(config, /127\.0\.0\.1:4173/);
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
    assert.match(config, /proxy_read_timeout 30s/);
  });
});

describe("pm2.ecosystem.config.js contract — docs/infrastructure/deployment.md", () => {
  const config = readRepo("infra/pm2.ecosystem.config.js");

  test("runs API cluster on main.js with production env", () => {
    assert.match(config, /print3d-api/);
    assert.match(config, /apps\/api\/dist\/main\.js/);
    assert.match(config, /exec_mode: "cluster"/);
    assert.match(config, /instances: 2/);
    assert.match(config, /max_memory_restart: "900M"/);
    assert.match(config, /PORT: 3001/);
  });

  test("runs TanStack Start web preview for SSR storefront", () => {
    assert.match(config, /print3d-web/);
    assert.match(config, /@print3d\/web start/);
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
