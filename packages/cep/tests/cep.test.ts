import { describe, expect, it } from "vitest";

import {
  CEP_FAIXA_DATA_VERSION,
  formatCepDisplay,
  listCepFaixas,
  lookupCep,
  lookupCepPrefix,
  parseCep,
} from "../src/index.js";

describe("parseCep", () => {
  it("normalizes masked CEP to eight digits", () => {
    const result = parseCep("01310-100");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.digits).toBe("01310100");
      expect(result.display).toBe("01310-100");
    }
  });

  it("rejects invalid characters", () => {
    const result = parseCep("abc");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("EMPTY_INPUT");
    }
  });
});

describe("formatCepDisplay", () => {
  it("returns masked CEP for valid input", () => {
    expect(formatCepDisplay("01310100")).toBe("01310-100");
  });

  it("returns null for invalid input", () => {
    expect(formatCepDisplay("invalid")).toBeNull();
  });
});

describe("lookupCep", () => {
  it("returns UF, city, and IBGE code for São Paulo CEP", () => {
    const result = lookupCep("01310-100");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.location.uf).toBe("SP");
      expect(result.location.cidade).toBe("São Paulo");
      expect(result.location.codigoIbge).toBe(3550308);
      expect(result.location.display).toBe("01310-100");
    }
  });

  it("returns Rio location for known prefix", () => {
    const result = lookupCep("20040-020");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.location.uf).toBe("RJ");
      expect(result.location.cidade).toBe("Rio de Janeiro");
    }
  });

  it("fails lookup when prefix is not in embedded dataset", () => {
    const result = lookupCep("99999-999");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("PREFIX_NOT_FOUND");
    }
  });
});

describe("lookupCepPrefix", () => {
  it("returns faixa by five-digit prefix", () => {
    const faixa = lookupCepPrefix("01310");

    expect(faixa).toBeDefined();
    expect(faixa?.uf).toBe("SP");
  });
});

describe("listCepFaixas", () => {
  it("exposes embedded IBGE CNEFE prefix dataset", () => {
    const faixas = listCepFaixas();

    expect(faixas.length).toBeGreaterThan(20_000);
    expect(CEP_FAIXA_DATA_VERSION.id).toBe("cep-faixas");
  });
});
