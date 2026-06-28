import { and, count, eq, gte, inArray, lte, sql } from "drizzle-orm";

import type {
  PaginatedResult,
  PaginationParams,
  ProductFilters,
} from "../../domain/repositories/IProductRepository.js";
import type { Product } from "@print3d/shared-types";
import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { Database } from "../db/client.js";
import { categories, products } from "../db/schema.js";
import { mapProductRow } from "./mappers/mapProduct.js";
import {
  buildPaginatedResult,
  normalizePagination,
} from "./pagination.js";

export async function findProductBySlug(
  db: Database,
  slug: string,
  locale: SupportedLocale,
): Promise<Product | null> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  const row = rows[0];
  return row ? mapProductRow(row, locale) : null;
}

export async function findProductById(
  db: Database,
  id: string,
  locale: SupportedLocale,
): Promise<Product | null> {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const row = rows[0];
  return row ? mapProductRow(row, locale) : null;
}

export async function findManyProducts(
  db: Database,
  filters: ProductFilters,
  pagination: PaginationParams,
  locale: SupportedLocale,
): Promise<PaginatedResult<Product>> {
  const { page, limit, offset } = normalizePagination(pagination);
  const whereClause = buildFilterConditions(filters);
  const rows = await db
    .select({ product: products })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);
  const total = await countFiltered(db, filters);
  return buildPaginatedResult(
    rows.map((row) => mapProductRow(row.product, locale)),
    total,
    page,
    limit,
  );
}

export async function searchProducts(
  db: Database,
  query: string,
  pagination: PaginationParams,
  locale: SupportedLocale,
): Promise<PaginatedResult<Product>> {
  const { page, limit, offset } = normalizePagination(pagination);
  const searchClause = buildSearchClause(query.trim(), locale);
  const whereClause = and(eq(products.status, "active"), searchClause);
  const rows = await db
    .select()
    .from(products)
    .where(whereClause)
    .limit(limit)
    .offset(offset);
  const countRows = await db
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

export async function findProductsByIds(
  db: Database,
  ids: string[],
  locale: SupportedLocale,
): Promise<Product[]> {
  if (ids.length === 0) {
    return [];
  }
  const rows = await db.select().from(products).where(inArray(products.id, ids));
  return rows.map((row) => mapProductRow(row, locale));
}

function buildFilterConditions(filters: ProductFilters) {
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

async function countFiltered(db: Database, filters: ProductFilters): Promise<number> {
  const whereClause = buildFilterConditions(filters);
  const result = await db
    .select({ value: count() })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClause);
  return Number(result[0]?.value ?? 0);
}

function buildSearchClause(query: string, locale: SupportedLocale) {
  if (locale === "en") {
    return sql`products.search_vector_en @@ plainto_tsquery('english', ${query})`;
  }
  return sql`products.search_vector_pt @@ plainto_tsquery('portuguese', ${query})`;
}
