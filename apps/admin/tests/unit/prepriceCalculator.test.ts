/**
 * Contract: docs/api/admin-contract.md — pre-price uses minutes / 60 for machine time
 */
import { describe, expect, it } from "vitest";

import {
  calculatePrepriceCents,
  minutesToStoredHours,
  storedHoursToMinutes,
} from "@/lib/prepriceCalculator";

const materialPricing = {
  PLA: {
    pricePerGramCents: 15,
    densityGCm3: 1.24,
    machineHourlyRateCents: 1500,
    handlingFeeCents: 500,
  },
};

const calculator = {
  machineHourlyRateCents: 1500,
  handlingFeeCents: 500,
  defaultInfillFactor: 0.2,
};

describe("calculatePrepriceCents", () => {
  it("converts print minutes to fractional hours for machine cost", () => {
    const cents = calculatePrepriceCents({
      material: "PLA",
      weightGrams: 100,
      printTimeMinutes: 120,
      materialPricing,
      calculator,
    });

    // 100*15 + 2h*1500 + 500 = 5000
    expect(cents).toBe(5000);
  });

  it("supports sub-hour print times via minutes", () => {
    const cents = calculatePrepriceCents({
      material: "PLA",
      weightGrams: 0,
      printTimeMinutes: 30,
      materialPricing,
      calculator,
    });

    // 0.5h * 1500 + 500 handling = 1250
    expect(cents).toBe(1250);
  });
});

describe("print time conversions", () => {
  it("rounds minutes to whole hours for API storage", () => {
    expect(minutesToStoredHours(90)).toBe(2);
    expect(storedHoursToMinutes(2)).toBe(120);
  });
});
