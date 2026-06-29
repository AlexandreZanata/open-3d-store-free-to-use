import type { CalculatorSettings, MaterialPricePerGram, MaterialType } from "@print3d/shared-types";

export type PrepriceInput = {
  material: MaterialType;
  weightGrams: number;
  printTimeHours: number;
  materialPricing: MaterialPricePerGram;
  calculator: CalculatorSettings;
};

/**
 * FDM pre-price (minor currency units) — material + machine time + handling.
 * References: All3DP cost guide; filament density from Prusa material datasheets (~1.24 g/cm³ PLA).
 */
export function calculatePrepriceCents(input: PrepriceInput): number {
  const materialRow = input.materialPricing[input.material];
  const pricePerGramCents = materialRow?.pricePerGramCents ?? 15;
  const materialCost = input.weightGrams * pricePerGramCents;
  const machineCost = input.printTimeHours * input.calculator.machineHourlyRateCents;
  const total = materialCost + machineCost + input.calculator.handlingFeeCents;
  return Math.max(0, Math.round(total));
}

export const DEFAULT_CALCULATOR_SETTINGS: CalculatorSettings = {
  machineHourlyRateCents: 1500,
  handlingFeeCents: 500,
  defaultInfillFactor: 0.2,
};

export const DEFAULT_MATERIAL_PRICING: MaterialPricePerGram = {
  PLA: { pricePerGramCents: 15, densityGCm3: 1.24 },
  PETG: { pricePerGramCents: 18, densityGCm3: 1.27 },
  PETG_HF: { pricePerGramCents: 20, densityGCm3: 1.27 },
  ABS: { pricePerGramCents: 17, densityGCm3: 1.04 },
  ASA: { pricePerGramCents: 22, densityGCm3: 1.07 },
  TPU: { pricePerGramCents: 35, densityGCm3: 1.21 },
  NYLON: { pricePerGramCents: 40, densityGCm3: 1.14 },
  RESIN: { pricePerGramCents: 45, densityGCm3: 1.1 },
};
