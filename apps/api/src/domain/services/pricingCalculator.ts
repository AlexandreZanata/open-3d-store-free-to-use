import type {
  CalculatorSettings,
  MaterialPricePerGram,
  MaterialPricingEntry,
  MaterialType,
} from "@print3d/shared-types";

export type PrepriceInput = {
  material: MaterialType;
  weightGrams: number;
  printTimeHours: number;
  materialPricing: MaterialPricePerGram;
  calculator: CalculatorSettings;
};

export type ResolvedMaterialRates = {
  pricePerGramCents: number;
  machineHourlyRateCents: number;
  handlingFeeCents: number;
};

/**
 * FDM pre-price (minor currency units) — material + machine time + handling.
 * Machine rate and handling fee are configured per material; calculator settings are fallbacks.
 * References: All3DP cost guide; filament density from Prusa material datasheets (~1.24 g/cm³ PLA).
 */
export function resolveMaterialRates(
  material: MaterialType,
  materialPricing: MaterialPricePerGram,
  calculator: CalculatorSettings,
): ResolvedMaterialRates {
  const row = materialPricing[material];
  return {
    pricePerGramCents: row?.pricePerGramCents ?? 15,
    machineHourlyRateCents:
      row?.machineHourlyRateCents ?? calculator.machineHourlyRateCents,
    handlingFeeCents: row?.handlingFeeCents ?? calculator.handlingFeeCents,
  };
}

export function calculatePrepriceCents(input: PrepriceInput): number {
  const rates = resolveMaterialRates(
    input.material,
    input.materialPricing,
    input.calculator,
  );
  const materialCost = input.weightGrams * rates.pricePerGramCents;
  const machineCost = input.printTimeHours * rates.machineHourlyRateCents;
  const total = materialCost + machineCost + rates.handlingFeeCents;
  return Math.max(0, Math.round(total));
}

export const DEFAULT_CALCULATOR_SETTINGS: CalculatorSettings = {
  machineHourlyRateCents: 1500,
  handlingFeeCents: 500,
  defaultInfillFactor: 0.2,
};

export const DEFAULT_MATERIAL_PRICING: MaterialPricePerGram = {
  PLA: materialEntry(15, 1.24, 1500, 500),
  PETG: materialEntry(18, 1.27, 1600, 550),
  PETG_HF: materialEntry(20, 1.27, 1700, 600),
  ABS: materialEntry(17, 1.04, 1800, 650),
  ASA: materialEntry(22, 1.07, 1900, 700),
  TPU: materialEntry(35, 1.21, 2200, 800),
  NYLON: materialEntry(40, 1.14, 2400, 900),
  RESIN: materialEntry(45, 1.1, 3000, 1000),
};

function materialEntry(
  pricePerGramCents: number,
  densityGCm3: number,
  machineHourlyRateCents: number,
  handlingFeeCents: number,
): MaterialPricingEntry {
  return { pricePerGramCents, densityGCm3, machineHourlyRateCents, handlingFeeCents };
}
