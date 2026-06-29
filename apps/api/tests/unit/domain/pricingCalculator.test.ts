/**
 * Contract: pricingCalculator — FDM pre-price formula
 */
import { describe, expect, it } from "vitest";

import {
  calculatePrepriceCents,
  DEFAULT_CALCULATOR_SETTINGS,
  DEFAULT_MATERIAL_PRICING,
} from "../../../src/domain/services/pricingCalculator.js";

describe("calculatePrepriceCents", () => {
  it("sums material, machine time, and handling fee in minor units", () => {
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

  it("falls back when material row is missing", () => {
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
      materialPricing: DEFAULT_MATERIAL_PRICING,
      calculator: { machineHourlyRateCents: 0, handlingFeeCents: 0, defaultInfillFactor: 0.2 },
    });

    expect(cents).toBe(0);
  });
});
