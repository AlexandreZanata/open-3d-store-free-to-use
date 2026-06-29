/**
 * Contract: docs/api/admin-contract.md — pre-price uses print hours × machine rate
 */
import { describe, expect, it } from "vitest";

import {
  calculatePrepriceCents,
  parsePrintTimeHoursInput,
  printTimeHoursToStoredHours,
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
  it("applies machine cost from print hours", () => {
    const cents = calculatePrepriceCents({
      material: "PLA",
      weightGrams: 100,
      printTimeHours: 2,
      materialPricing,
      calculator,
    });

    expect(cents).toBe(5000);
  });

  it("supports fractional hours (e.g. 0.5 h)", () => {
    const cents = calculatePrepriceCents({
      material: "PLA",
      weightGrams: 0,
      printTimeHours: 0.5,
      materialPricing,
      calculator,
    });

    expect(cents).toBe(1250);
  });
});

describe("print time helpers", () => {
  it("parses decimal hours from form input", () => {
    expect(parsePrintTimeHoursInput("1,5")).toBe(1.5);
    expect(printTimeHoursToStoredHours(1.5)).toBe(2);
  });
});
