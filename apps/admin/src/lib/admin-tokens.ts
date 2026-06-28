import type { PrintStatus } from "@print3d/shared-types";

export const adminTokens = {
  pageTitle: "text-2xl font-semibold tracking-tight text-foreground",
  sectionTitle: "text-base font-semibold text-foreground",
  label: "text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground",
  hairlineBorder: "border border-hairline",
  surface: "bg-surface",
  sidebarWidth: "w-60",
  sidebarActive: "bg-primary text-primary-foreground",
  sidebarItem: "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted transition-colors",
} as const;

export const printStatusColors: Record<
  PrintStatus,
  { dot: string; badge: string; label: string }
> = {
  active: {
    dot: "bg-status-active",
    badge: "text-status-active border-status-active/30",
    label: "Active",
  },
  out_of_stock: {
    dot: "bg-status-out-of-stock",
    badge: "text-status-out-of-stock border-status-out-of-stock/30",
    label: "Out of stock",
  },
  discontinued: {
    dot: "bg-status-discontinued",
    badge: "text-status-discontinued border-status-discontinued/30",
    label: "Discontinued",
  },
};

export function getPrintStatusLabel(status: PrintStatus): string {
  return printStatusColors[status].label;
}
