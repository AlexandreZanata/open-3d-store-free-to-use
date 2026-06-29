#!/usr/bin/env node
/**
 * Builds transparent PNG brand assets from assets/brand/corvo-logo-source.png.
 * Delegates to apps/api/scripts/generateBrandIcons.mjs (requires sharp via @print3d/api).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const script = path.join(repoRoot, "apps/api/scripts/generateBrandIcons.mjs");

const result = spawnSync("node", [script], { stdio: "inherit", cwd: repoRoot });
process.exit(result.status ?? 1);
