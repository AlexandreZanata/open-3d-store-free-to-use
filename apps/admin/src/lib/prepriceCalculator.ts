import type {
  CalculatorSettings,
  MaterialPricePerGram,
  MaterialType,
} from "@print3d/shared-types";

/** Contract: docs/api/admin-contract.md — bulk pre-price formula (hours × machine rate). */
export function calculatePrepriceCents(input: {
  material: MaterialType;
  weightGrams: number;
  printTimeHours: number;
  materialPricing: MaterialPricePerGram;
  calculator: CalculatorSettings;
}): number {
  const row = input.materialPricing[input.material];
  const pricePerGramCents = row?.pricePerGramCents ?? 15;
  const machineHourlyRateCents =
    row?.machineHourlyRateCents ?? input.calculator.machineHourlyRateCents;
  const handlingFeeCents = row?.handlingFeeCents ?? input.calculator.handlingFeeCents;
  const materialCost = input.weightGrams * pricePerGramCents;
  const machineCost = input.printTimeHours * machineHourlyRateCents;
  const total = materialCost + machineCost + handlingFeeCents;
  return Math.max(0, Math.round(total));
}

/** API stores whole hours; form may use decimals (e.g. 1.5) for pre-price before save. */
export function parsePrintTimeHoursInput(value: string): number {
  const normalized = value.trim().replace(",", ".");
  const hours = Number(normalized);
  return Number.isFinite(hours) && hours >= 0 ? hours : 0;
}

export function printTimeHoursToStoredHours(hours: number): number {
  return Math.max(0, Math.round(hours));
}
