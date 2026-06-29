import { describe, expect, it } from "vitest";

import {
  readLocaleCookie,
  resolveAcceptLanguageLocale,
  resolveRequestLocale,
} from "@/lib/resolve-locale";

describe("resolve-locale (contract: docs/features/i18n.md)", () => {
  it("reads locale cookie values", () => {
    expect(readLocaleCookie("locale=pt-BR; other=1")).toBe("pt-BR");
    expect(readLocaleCookie("locale=en")).toBe("en");
    expect(readLocaleCookie("other=1")).toBeNull();
  });

  it("resolves Accept-Language for SSR", () => {
    expect(resolveAcceptLanguageLocale("pt-BR,pt;q=0.9,en;q=0.8")).toBe("pt-BR");
    expect(resolveAcceptLanguageLocale("en-US,en;q=0.9")).toBe("en");
    expect(resolveAcceptLanguageLocale(null)).toBe("pt-BR");
  });

  it("prefers cookie over Accept-Language on the server", () => {
    expect(resolveRequestLocale("en-US,en;q=0.9", "locale=pt-BR")).toBe("pt-BR");
    expect(resolveRequestLocale("en-US,en;q=0.9", null)).toBe("en");
  });
});
