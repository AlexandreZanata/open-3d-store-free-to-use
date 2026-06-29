/** Short display ID per docs/features/whatsapp-flow.md (first 8 hex chars, uppercase). */
export function formatOrderDisplayId(orderId: string): string {
  return orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function startOfTodayIso(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/** Start of local day N days ago — stable for React Query keys and API date filters. */
export function daysAgoStartOfDayIso(days: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const ORDERS_LIST_LOOKBACK_DAYS = 30;

export function ordersListLookbackFrom(): string {
  return daysAgoStartOfDayIso(ORDERS_LIST_LOOKBACK_DAYS);
}
