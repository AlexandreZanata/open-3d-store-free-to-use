import type { MaterialType, PrintStatus, Product } from "@print3d/shared-types";

import type { SupportedLocale } from "../value-objects/Locale.js";

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
};

export type ProductFilters = {
  category?: string | undefined;
  material?: MaterialType | undefined;
  status?: PrintStatus | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
};

export interface IProductRepository {
  findBySlug(slug: string, locale: SupportedLocale): Promise<Product | null>;
  findById(id: string, locale: SupportedLocale): Promise<Product | null>;
  findMany(
    filters: ProductFilters,
    pagination: PaginationParams,
    locale: SupportedLocale,
  ): Promise<PaginatedResult<Product>>;
  search(
    query: string,
    pagination: PaginationParams,
    locale: SupportedLocale,
  ): Promise<PaginatedResult<Product>>;
  findByIds(ids: string[], locale: SupportedLocale): Promise<Product[]>;
}
