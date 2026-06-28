import { eq } from "drizzle-orm";

import type {
  AdminProductFilters,
  IProductRepository,
  PaginatedResult,
  PaginationParams,
  ProductFilters,
} from "../../domain/repositories/IProductRepository.js";
import type {
  AdminProductListItem,
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from "@print3d/shared-types";
import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { Database } from "../db/client.js";
import { products } from "../db/schema.js";
import { mapAdminProductRow } from "./mappers/mapAdminCatalog.js";
import {
  countProductOrderReferences,
  createAdminProduct,
  deleteAdminProduct,
  findManyAdminProducts,
  productExistsBySlug,
  updateAdminProduct,
} from "./productAdminPersistence.js";
import {
  findManyProducts,
  findProductById,
  findProductBySlug,
  findProductsByIds,
  searchProducts,
} from "./productReadPersistence.js";

export class DrizzleProductRepository implements IProductRepository {
  constructor(private readonly db: Database) {}

  findBySlug(slug: string, locale: SupportedLocale): Promise<Product | null> {
    return findProductBySlug(this.db, slug, locale);
  }

  findById(id: string, locale: SupportedLocale): Promise<Product | null> {
    return findProductById(this.db, id, locale);
  }

  findMany(
    filters: ProductFilters,
    pagination: PaginationParams,
    locale: SupportedLocale,
  ): Promise<PaginatedResult<Product>> {
    return findManyProducts(this.db, filters, pagination, locale);
  }

  search(
    query: string,
    pagination: PaginationParams,
    locale: SupportedLocale,
  ): Promise<PaginatedResult<Product>> {
    return searchProducts(this.db, query, pagination, locale);
  }

  findByIds(ids: string[], locale: SupportedLocale): Promise<Product[]> {
    return findProductsByIds(this.db, ids, locale);
  }

  create(input: CreateProductPayload): Promise<AdminProductListItem> {
    return createAdminProduct(this.db, input);
  }

  update(id: string, input: UpdateProductPayload): Promise<AdminProductListItem> {
    return updateAdminProduct(this.db, id, input);
  }

  delete(id: string): Promise<void> {
    return deleteAdminProduct(this.db, id);
  }

  findManyAdmin(filters: AdminProductFilters, pagination: PaginationParams) {
    return findManyAdminProducts(this.db, filters, pagination);
  }

  async findByIdAdmin(id: string): Promise<AdminProductListItem | null> {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    const row = rows[0];
    return row ? mapAdminProductRow(row) : null;
  }

  existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    return productExistsBySlug(this.db, slug, excludeId);
  }

  countOrderReferences(productId: string): Promise<number> {
    return countProductOrderReferences(this.db, productId);
  }
}
