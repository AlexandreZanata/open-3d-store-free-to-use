import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
const adminBaseURL = process.env.ADMIN_BASE_URL ?? "http://localhost:5174";
const adminAuthFile = path.join("e2e", ".auth", "admin-session.json");
const apiPort = process.env.PLAYWRIGHT_API_PORT ?? "3010";
const apiHost = process.env.PLAYWRIGHT_API_HOST ?? "localhost";
const apiBase = `http://${apiHost}:${apiPort}`;
const apiURL = `${apiBase}/api/v1/health`;
const hasDatabase = Boolean(process.env.DATABASE_URL);

const skipWebServer = Boolean(process.env.PLAYWRIGHT_SKIP_WEBSERVER);

const sharedServerEnv = {
  ...process.env,
  PORT: apiPort,
  ADMIN_ORIGIN: adminBaseURL,
  ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@test.local",
  ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "test-password-12",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? baseURL,
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ["admin-*.spec.ts"],
    },
    {
      name: "admin-setup",
      testMatch: /admin\.setup\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: adminBaseURL,
      },
    },
    {
      name: "admin-chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: adminBaseURL,
      },
      testMatch: ["admin-auth.spec.ts"],
    },
    {
      name: "admin-crud-chromium",
      dependencies: ["admin-setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: adminBaseURL,
        storageState: adminAuthFile,
      },
      testMatch: ["admin-product-crud.spec.ts"],
    },
    {
      name: "admin-orders-chromium",
      dependencies: ["admin-setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: adminBaseURL,
        storageState: adminAuthFile,
      },
      testMatch: ["admin-orders.spec.ts"],
    },
    {
      name: "admin-mobile-chromium",
      dependencies: ["admin-setup"],
      use: {
        ...devices["Pixel 5"],
        baseURL: adminBaseURL,
        storageState: adminAuthFile,
      },
      testMatch: ["admin-mobile.spec.ts"],
    },
  ],
  webServer:
    hasDatabase && !skipWebServer
      ? [
          {
            command: `PORT=${apiPort} pnpm --filter @print3d/api dev`,
            url: apiURL,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
            cwd: ".",
            env: sharedServerEnv,
          },
          {
            command: `VITE_API_BASE_URL=${apiBase}/api/v1 pnpm --filter @print3d/web dev`,
            url: baseURL,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
            env: sharedServerEnv,
          },
          {
            command: `VITE_API_BASE_URL=${apiBase}/api/v1 VITE_ASSETS_BASE_URL=${apiBase} VITE_WHATSAPP_PHONE=${process.env.WHATSAPP_PHONE_NUMBER ?? "5565999999999"} pnpm --filter @print3d/admin dev -- --host 127.0.0.1 --port 5174`,
            url: adminBaseURL,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
            env: sharedServerEnv,
          },
        ]
      : undefined,
});
