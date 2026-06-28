import type {
  PaginatedResult,
  PaginationParams,
} from "../../domain/repositories/IProductRepository.js";

const MAX_PAGE_SIZE = 50;

export function normalizePagination(pagination: PaginationParams): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, pagination.page);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, pagination.limit));
  return { page, limit, offset: (page - 1) * limit };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    pagination: {
      total,
      page,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      limit,
    },
  };
}
