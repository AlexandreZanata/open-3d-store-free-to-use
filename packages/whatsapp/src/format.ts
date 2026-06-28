/**
 * Formats integer BRL cents as Brazilian Real display string.
 * Example: 9000 → "R$ 90,00"
 */
export function formatBrlCents(cents: number): string {
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  return `R$ ${reais.toLocaleString("pt-BR")},${centavos.toString().padStart(2, "0")}`;
}

/**
 * Short display ID for WhatsApp messages (first 8 hex chars, uppercase).
 */
export function formatOrderDisplayId(orderId: string): string {
  return orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
}
