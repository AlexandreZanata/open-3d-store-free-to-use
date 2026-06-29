import type { PaginationMeta } from "@print3d/shared-types";

export type TablePaginationState = Pick<PaginationMeta, "page" | "totalPages" | "total">;

export function formatTablePaginationSummary(state: TablePaginationState): string {
  return `Page ${state.page} of ${state.totalPages} (${state.total} total)`;
}

export function toTablePagination(meta: PaginationMeta): TablePaginationState {
  return {
    page: meta.page,
    totalPages: meta.totalPages,
    total: meta.total,
  };
}
