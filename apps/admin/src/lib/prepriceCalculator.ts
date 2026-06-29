import type {
  CalculatorSettings,
  MaterialPricePerGram,
  MaterialType,
} from "@print3d/shared-types";

/** Contract: docs/api/admin-contract.md — bulk pre-price formula */
export function calculatePrepriceCents(input: {
  material: MaterialType;
  weightGrams: number;
  printTimeMinutes: number;
  materialPricing: MaterialPricePerGram;
  calculator: CalculatorSettings;
}): number {
  const row = input.materialPricing[input.material];
  const pricePerGramCents = row?.pricePerGramCents ?? 15;
  const machineHourlyRateCents =
    row?.machineHourlyRateCents ?? input.calculator.machineHourlyRateCents;
  const handlingFeeCents = row?.handlingFeeCents ?? input.calculator.handlingFeeCents;
  const printTimeHours = input.printTimeMinutes / 60;
  const materialCost = input.weightGrams * pricePerGramCents;
  const machineCost = printTimeHours * machineHourlyRateCents;
  const total = materialCost + machineCost + handlingFeeCents;
  return Math.max(0, Math.round(total));
}

/** Stored API field is whole hours; form edits in minutes. */
export function minutesToStoredHours(minutes: number): number {
  return Math.max(0, Math.round(minutes / 60));
}

export function storedHoursToMinutes(hours: number): number {
  return Math.max(0, hours * 60);
}
