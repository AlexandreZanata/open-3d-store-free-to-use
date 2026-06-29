import { describe, expect, it } from "vitest";

import en from "../../src/i18n/locales/en.json";
import ptBR from "../../src/i18n/locales/pt-BR.json";

describe("brand — Corvo 3D", () => {
  it("uses Corvo 3D as the public storefront name in both locales", () => {
    expect(en.app.name).toBe("Corvo 3D");
    expect(ptBR.app.name).toBe("Corvo 3D");
  });
});
