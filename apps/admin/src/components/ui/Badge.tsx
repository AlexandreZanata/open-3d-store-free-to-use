import type { PrintStatus } from "@print3d/shared-types";

import { printStatusColors } from "@/lib/admin-tokens";
import { cn } from "@/lib/utils";

type BadgeProps = {
  status: PrintStatus;
  className?: string;
};

export function Badge({ status, className }: BadgeProps) {
  const colors = printStatusColors[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colors.badge,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", colors.dot)} aria-hidden />
      {colors.label}
    </span>
  );
}
