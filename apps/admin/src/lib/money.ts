/** Convert BRL reais input (e.g. "45.00") to integer cents for API payloads. */
export function reaisToCents(input: string): number {
  const normalized = input.trim().replace(",", ".");
  if (normalized.length === 0) return Number.NaN;

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return Number.NaN;

  return Math.round(value * 100);
}

/** Format stored cents for form input display. */
export function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Display price in admin tables — matches storefront BRL format pattern. */
export function formatBrlCents(cents: number): string {
  const reais = Math.floor(cents / 100);
  const centavos = Math.abs(cents % 100)
    .toString()
    .padStart(2, "0");
  return `R$ ${reais.toLocaleString("pt-BR")},${centavos}`;
}
