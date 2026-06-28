import { describe, expect, it } from "vitest";

import en from "../src/i18n/locales/en.json";
import ptBR from "../src/i18n/locales/pt-BR.json";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

describe("i18n locale parity (contract: docs/features/i18n.md)", () => {
  it("en and pt-BR have identical translation keys", () => {
    const enKeys = flattenKeys(en);
    const ptKeys = flattenKeys(ptBR);
    expect(ptKeys).toEqual(enKeys);
  });
});
