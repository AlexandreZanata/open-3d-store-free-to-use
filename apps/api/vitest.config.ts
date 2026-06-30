import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const apiRoot = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(apiRoot, ".env");

function loadDotEnv(file: string): Record<string, string> {
  if (!existsSync(file)) {
    return {};
  }
  const values: Record<string, string> = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const raw = trimmed.slice(eq + 1).trim();
    values[key] = raw.replace(/^['"]|['"]$/g, "");
  }
  return values;
}

/** Local `.env` plus existing process env (CI sets DATABASE_URL, etc.). */
function resolveTestEnv(file: string): Record<string, string> {
  const merged = loadDotEnv(file);
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      merged[key] = value;
    }
  }
  return merged;
}

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
    fileParallelism: false,
    env: resolveTestEnv(envPath),
  },
});
