import { and, count, eq, gte, inArray, lte, sql } from "drizzle-orm";

import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type {
  IProductRepository,
  PaginatedResult,
  PaginationParams,
  ProductFilters,
} from "../../domain/repositories/IProductRepository.js";
import type { Product } from "@print3d/shared-types";
import type { Database } from "../db/client.js";
import { categories, products } from "../db/schema.js";
import { mapProductRow } from "./mappers/mapProduct.js";
import {
  buildPaginatedResult,
  normalizePagination,
} from "./pagination.js";

export class DrizzleProductRepository implements IProductRepository {
  constructor(private readonly db: Database) {}

  async findBySlug(
    slug: string,
    locale: SupportedLocale,
  ): Promise<Product | null> {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    const row = rows[0];
    return row ? mapProductRow(row, locale) : null;
  }

  async findById(id: string, locale: SupportedLocale): Promise<Product | null> {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    const row = rows[0];
    return row ? mapProductRow(row, locale) : null;
  }

  async findMany(
    filters: ProductFilters,
    pagination: PaginationParams,
    locale: SupportedLocale,
  ): Promise<PaginatedResult<Product>> {
    const { page, limit, offset } = normalizePagination(pagination);
    const whereClause = this.buildFilterConditions(filters);

    const baseQuery = this.db
      .select({ product: products })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause);

    const rows = await baseQuery.limit(limit).offset(offset);
    const total = await this.countFiltered(filters);

    return buildPaginatedResult(
      rows.map((row) => mapProductRow(row.product, locale)),
      total,
      page,
      limit,
    );
  }

  async search(
    query: string,
    pagination: PaginationParams,
    locale: SupportedLocale,
  ): Promise<PaginatedResult<Product>> {
    const { page, limit, offset } = normalizePagination(pagination);
    const searchClause = this.buildSearchClause(query.trim(), locale);
    const whereClause = and(eq(products.status, "active"), searchClause);

    const rows = await this.db
      .select()
      .from(products)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const countRows = await this.db
      .select({ value: count() })
      .from(products)
      .where(whereClause);

    const total = Number(countRows[0]?.value ?? 0);

    return buildPaginatedResult(
      rows.map((row) => mapProductRow(row, locale)),
      total,
      page,
      limit,
    );
  }

  async findByIds(ids: string[], locale: SupportedLocale): Promise<Product[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.db
      .select()
      .from(products)
      .where(inArray(products.id, ids));

    return rows.map((row) => mapProductRow(row, locale));
  }

  private buildFilterConditions(filters: ProductFilters) {
    const conditions = [];

    if (filters.category !== undefined) {
      conditions.push(eq(categories.slug, filters.category));
    }
    if (filters.material !== undefined) {
      conditions.push(eq(products.material, filters.material));
    }
    if (filters.status !== undefined) {
      conditions.push(eq(products.status, filters.status));
    } else {
      conditions.push(eq(products.status, "active"));
    }
    if (filters.minPrice !== undefined) {
      conditions.push(gte(products.basePrice, filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      conditions.push(lte(products.basePrice, filters.maxPrice));
    }

    return and(...conditions);
  }

  private async countFiltered(filters: ProductFilters): Promise<number> {
    const whereClause = this.buildFilterConditions(filters);
    const result = await this.db
      .select({ value: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(whereClause);

    return Number(result[0]?.value ?? 0);
  }

  private buildSearchClause(query: string, locale: SupportedLocale) {
    if (locale === "en") {
      return sql`products.search_vector_en @@ plainto_tsquery('english', ${query})`;
    }
    return sql`products.search_vector_pt @@ plainto_tsquery('portuguese', ${query})`;
  }
}
