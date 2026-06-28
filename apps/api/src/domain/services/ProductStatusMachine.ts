import type { PrintStatus } from "@print3d/shared-types";

import { DomainError } from "../errors/DomainError.js";

const ALLOWED_TRANSITIONS: Record<PrintStatus, PrintStatus[]> = {
  active: ["out_of_stock", "discontinued"],
  out_of_stock: ["active", "discontinued"],
  discontinued: ["active"],
};

export function assertProductStatusTransition(
  current: PrintStatus,
  next: PrintStatus,
): void {
  if (current === next) {
    return;
  }
  if (!ALLOWED_TRANSITIONS[current].includes(next)) {
    throw new DomainError(
      `Invalid status transition from ${current} to ${next}`,
    );
  }
}
