import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
const apiPort = process.env.PLAYWRIGHT_API_PORT ?? "3010";
const apiHost = process.env.PLAYWRIGHT_API_HOST ?? "localhost";
const apiBase = `http://${apiHost}:${apiPort}`;
const apiURL = `${apiBase}/api/v1/health`;
const hasDatabase = Boolean(process.env.DATABASE_URL);

const skipWebServer = Boolean(process.env.PLAYWRIGHT_SKIP_WEBSERVER);

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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer:
    hasDatabase && !skipWebServer
    ? [
        {
          command: `PORT=${apiPort} pnpm --filter @print3d/api dev`,
          url: apiURL,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          cwd: ".",
          env: {
            ...process.env,
            PORT: apiPort,
          },
        },
        {
          command: `VITE_API_BASE_URL=${apiBase}/api/v1 pnpm --filter @print3d/web dev`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      ]
    : undefined,
});
