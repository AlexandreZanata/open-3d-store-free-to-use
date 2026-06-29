import type {
  AdminProductListItem,
  CreateProductPayload,
  MaterialType,
  ModelPart,
  PrintStatus,
  Product,
  UpdateProductPayload,
} from "@print3d/shared-types";

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

export type AdminProductFilters = {
  status?: PrintStatus | undefined;
  category?: string | undefined;
  q?: string | undefined;
};

export type OrderDateRange = {
  from?: Date | undefined;
  to?: Date | undefined;
};

export type BulkPrepriceProductRow = {
  id: string;
  material: MaterialType;
  printTimeHours: number;
  modelParts: ModelPart[];
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
  create(input: CreateProductPayload): Promise<AdminProductListItem>;
  update(id: string, input: UpdateProductPayload): Promise<AdminProductListItem>;
  delete(id: string): Promise<void>;
  findManyAdmin(
    filters: AdminProductFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<AdminProductListItem>>;
  findByIdAdmin(id: string): Promise<AdminProductListItem | null>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  countOrderReferences(productId: string): Promise<number>;
  listForBulkPreprice(): Promise<BulkPrepriceProductRow[]>;
  updatePreprice(id: string, basePrice: number, weightGrams: number): Promise<void>;
}
