/**
 * Contract: docs/api/admin-contract.md — per-material pre-price formula
 */
import { describe, expect, it } from "vitest";

import {
  calculatePrepriceCents,
  DEFAULT_CALCULATOR_SETTINGS,
  DEFAULT_MATERIAL_PRICING,
  resolveMaterialRates,
} from "../../../src/domain/services/pricingCalculator.js";

describe("calculatePrepriceCents", () => {
  it("sums material, machine time, and handling fee using per-material PLA rates", () => {
    const cents = calculatePrepriceCents({
      material: "PLA",
      weightGrams: 100,
      printTimeHours: 2,
      materialPricing: DEFAULT_MATERIAL_PRICING,
      calculator: DEFAULT_CALCULATOR_SETTINGS,
    });

    // 100g * 15 + 2h * 1500 + 500 handling = 5000
    expect(cents).toBe(5000);
  });

  it("uses material-specific machine rate and handling fee", () => {
    const pla = calculatePrepriceCents({
      material: "PLA",
      weightGrams: 50,
      printTimeHours: 1,
      materialPricing: DEFAULT_MATERIAL_PRICING,
      calculator: DEFAULT_CALCULATOR_SETTINGS,
    });
    const tpu = calculatePrepriceCents({
      material: "TPU",
      weightGrams: 50,
      printTimeHours: 1,
      materialPricing: DEFAULT_MATERIAL_PRICING,
      calculator: DEFAULT_CALCULATOR_SETTINGS,
    });

    // TPU: higher price/g, machine rate, and handling than PLA
    expect(tpu).toBeGreaterThan(pla);
    expect(pla).toBe(50 * 15 + 1500 + 500);
    expect(tpu).toBe(50 * 35 + 2200 + 800);
  });

  it("falls back to calculator defaults when material row is missing", () => {
    const cents = calculatePrepriceCents({
      material: "PLA",
      weightGrams: 10,
      printTimeHours: 0,
      materialPricing: {},
      calculator: { machineHourlyRateCents: 0, handlingFeeCents: 0, defaultInfillFactor: 0.2 },
    });

    expect(cents).toBe(150);
  });

  it("never returns negative prices", () => {
    const cents = calculatePrepriceCents({
      material: "PLA",
      weightGrams: 0,
      printTimeHours: 0,
      materialPricing: {
        PLA: {
          pricePerGramCents: 0,
          densityGCm3: 1.24,
          machineHourlyRateCents: 0,
          handlingFeeCents: 0,
        },
      },
      calculator: { machineHourlyRateCents: 0, handlingFeeCents: 0, defaultInfillFactor: 0.2 },
    });

    expect(cents).toBe(0);
  });
});

describe("resolveMaterialRates", () => {
  it("returns per-material machine and handling values", () => {
    const rates = resolveMaterialRates("RESIN", DEFAULT_MATERIAL_PRICING, DEFAULT_CALCULATOR_SETTINGS);
    expect(rates.machineHourlyRateCents).toBe(3000);
    expect(rates.handlingFeeCents).toBe(1000);
  });
});
