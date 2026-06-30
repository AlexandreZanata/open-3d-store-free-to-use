import { and, count, eq, ilike, ne, or, sql } from "drizzle-orm";

import type {
  AdminProductFilters,
  PaginationParams,
} from "../../domain/repositories/IProductRepository.js";
import type { CreateProductPayload, UpdateProductPayload } from "@print3d/shared-types";
import type { Database } from "../db/client.js";
import { categories, orderCaptures, products } from "../db/schema.js";
import {
  mapAdminProductRow,
  syncProductLegacyFields,
} from "./mappers/mapAdminCatalog.js";
import {
  buildPaginatedResult,
  normalizeAdminPagination,
} from "./pagination.js";

export async function createAdminProduct(
  db: Database,
  input: CreateProductPayload,
) {
  const legacy = syncProductLegacyFields(input.translations);
  const rows = await db
    .insert(products)
    .values({
      slug: input.slug,
      categoryId: input.categoryId,
      basePrice: input.basePrice,
      material: input.material,
      printTimeHours: input.printTimeHours,
      weightGrams: input.weightGrams,
      status: input.status,
      options: input.options,
      modelFileUrl: input.modelFileUrl,
      modelParts: input.modelParts,
      thumbnailUrl: input.thumbnailUrl,
      imageUrls: input.imageUrls,
      tags: input.tags,
      translations: input.translations,
      isFeatured: input.isFeatured,
      name: legacy.name,
      description: legacy.description,
      shortDescription: legacy.shortDescription,
    })
    .returning();

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to create product");
  }
  return mapAdminProductRow(row);
}

export async function updateAdminProduct(
  db: Database,
  id: string,
  input: UpdateProductPayload,
) {
  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  const current = existing[0];
  if (!current) {
    throw new Error("Product not found");
  }

  const translations =
    input.translations ?? (current.translations as CreateProductPayload["translations"]);
  const legacy = syncProductLegacyFields(translations);
  const rows = await db
    .update(products)
    .set({
      slug: input.slug ?? current.slug,
      categoryId: input.categoryId ?? current.categoryId,
      basePrice: input.basePrice ?? current.basePrice,
      material: input.material ?? current.material,
      printTimeHours: input.printTimeHours ?? current.printTimeHours,
      weightGrams: input.weightGrams ?? current.weightGrams,
      status: input.status ?? current.status,
      options: input.options ?? current.options,
      modelFileUrl: input.modelFileUrl ?? current.modelFileUrl,
      modelParts: input.modelParts ?? current.modelParts,
      thumbnailUrl: input.thumbnailUrl ?? current.thumbnailUrl,
      imageUrls: input.imageUrls ?? current.imageUrls,
      tags: input.tags ?? current.tags,
      translations,
      isFeatured: input.isFeatured ?? current.isFeatured,
      name: legacy.name,
      description: legacy.description,
      shortDescription: legacy.shortDescription,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to update product");
  }
  return mapAdminProductRow(row);
}

export async function deleteAdminProduct(db: Database, id: string): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
}

export async function findManyAdminProducts(
  db: Database,
  filters: AdminProductFilters,
  pagination: PaginationParams,
) {
  const { page, limit, offset } = normalizeAdminPagination(pagination);
  const conditions = [];

  if (filters.status !== undefined) {
    conditions.push(eq(products.status, filters.status));
  }
  if (filters.category !== undefined) {
    conditions.push(eq(categories.slug, filters.category));
  }
  if (filters.q !== undefined && filters.q.trim().length > 0) {
    const pattern = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(products.slug, pattern),
        ilike(products.name, pattern),
        sql`${products.translations}::text ILIKE ${pattern}`,
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = await db
    .select({ product: products })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  const totalRows = await db
    .select({ value: count() })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClause);

  const total = Number(totalRows[0]?.value ?? 0);
  return buildPaginatedResult(
    rows.map((row: { product: typeof products.$inferSelect }) =>
      mapAdminProductRow(row.product),
    ),
    total,
    page,
    limit,
  );
}

export async function productExistsBySlug(
  db: Database,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const conditions = [eq(products.slug, slug)];
  if (excludeId !== undefined) {
    conditions.push(ne(products.id, excludeId));
  }
  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(and(...conditions))
    .limit(1);
  return rows.length > 0;
}

export async function countProductOrderReferences(
  db: Database,
  productId: string,
): Promise<number> {
  const result = await db
    .select({
      value: sql<number>`count(*)::int`,
    })
    .from(orderCaptures)
    .where(
      sql`EXISTS (
        SELECT 1
        FROM jsonb_array_elements(${orderCaptures.items}) AS item
        WHERE item->>'productId' = ${productId}
      )`,
    );

  return Number(result[0]?.value ?? 0);
}
