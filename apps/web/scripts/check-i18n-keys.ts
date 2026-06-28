import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function flattenKeys(obj: JsonObject, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as JsonObject, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

function loadLocale(fileName: string): JsonObject {
  const dir = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(dir, "../src/i18n/locales", fileName), "utf8");
  return JSON.parse(raw) as JsonObject;
}

function diffKeys(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return left.filter((key) => !rightSet.has(key));
}

const enKeys = flattenKeys(loadLocale("en.json"));
const ptKeys = flattenKeys(loadLocale("pt-BR.json"));

const missingInPt = diffKeys(enKeys, ptKeys);
const missingInEn = diffKeys(ptKeys, enKeys);

if (missingInPt.length > 0 || missingInEn.length > 0) {
  if (missingInPt.length > 0) {
    console.error("Missing in pt-BR.json:", missingInPt.join(", "));
  }
  if (missingInEn.length > 0) {
    console.error("Missing in en.json:", missingInEn.join(", "));
  }
  process.exit(1);
}

console.log(`i18n key parity OK (${enKeys.length} keys)`);
