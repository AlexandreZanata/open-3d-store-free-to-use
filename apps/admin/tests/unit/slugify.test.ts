/**
 * Contract: docs/api/admin-contract.md — slug 2–100 chars, lowercase hyphenated.
 */
import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/slugify";

describe("slugify — admin contract slug rules", () => {
  it("lowercases and hyphenates pt-BR product names", () => {
    expect(slugify("Porta-retrato personalizado")).toBe("porta-retrato-personalizado");
  });

  it("strips accents from Portuguese characters", () => {
    expect(slugify("Miniaturas São Paulo")).toBe("miniaturas-sao-paulo");
  });

  it("matches documented example slug shape", () => {
    expect(slugify("Custom Photo Frame")).toBe("custom-photo-frame");
  });
});
