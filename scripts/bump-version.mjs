#!/usr/bin/env node
/** Bump root package.json semver (patch | minor | major). */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const part = process.argv[2] ?? "patch";
if (!["patch", "minor", "major"].includes(part)) {
  console.error("usage: bump-version.mjs [patch|minor|major]");
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = resolve(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(pkg.version ?? "");
if (!match) {
  console.error(`bump-version: invalid version "${pkg.version ?? ""}"`);
  process.exit(1);
}

let [, major, minor, patch] = match.map(Number);
if (part === "major") {
  major += 1;
  minor = 0;
  patch = 0;
} else if (part === "minor") {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}

pkg.version = `${major}.${minor}.${patch}`;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(pkg.version);
