import { describe, expect, it } from "vitest";

import { DomainError } from "../../../src/domain/errors/DomainError.js";
import { Locale } from "../../../src/domain/value-objects/Locale.js";

describe("Locale", () => {
  it("accepts supported locales from i18n policy", () => {
    expect(Locale.parse("en").toString()).toBe("en");
    expect(Locale.parse("pt-BR").toString()).toBe("pt-BR");
  });

  it("rejects unsupported locale es", () => {
    expect(() => Locale.parse("es")).toThrow(DomainError);
    expect(() => Locale.parse("es")).toThrow("Unsupported locale: es");
  });

  it("normalizes pt to pt-BR", () => {
    expect(Locale.parse("pt").toString()).toBe("pt-BR");
    expect(Locale.parse("PT-br").toString()).toBe("pt-BR");
  });

  it("returns fallback chain requested then en then pt-BR", () => {
    expect(Locale.parse("pt-BR").getFallbackChain()).toEqual(["pt-BR", "en"]);
    expect(Locale.parse("en").getFallbackChain()).toEqual(["en", "pt-BR"]);
  });

  it("defaults missing input to pt-BR per API contract", () => {
    expect(Locale.parse(null).toString()).toBe("pt-BR");
    expect(Locale.parse("").toString()).toBe("pt-BR");
  });
});
