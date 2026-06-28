import { and, count, eq, ne } from "drizzle-orm";

import type { CreateCategoryPayload, UpdateCategoryPayload } from "@print3d/shared-types";
import type { Database } from "../db/client.js";
import { categories, products } from "../db/schema.js";
import {
  mapAdminCategoryRow,
  syncCategoryLegacyFields,
} from "./mappers/mapAdminCatalog.js";

export async function createAdminCategory(
  db: Database,
  input: CreateCategoryPayload,
) {
  const legacy = syncCategoryLegacyFields(input.translations);
  const rows = await db
    .insert(categories)
    .values({
      slug: input.slug,
      parentId: input.parentId,
      imageUrl: input.imageUrl,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      translations: input.translations,
      name: legacy.name,
      description: legacy.description,
    })
    .returning();

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to create category");
  }
  return mapAdminCategoryRow(row);
}

export async function updateAdminCategory(
  db: Database,
  id: string,
  input: UpdateCategoryPayload,
) {
  const existing = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  const current = existing[0];
  if (!current) {
    throw new Error("Category not found");
  }

  const translations =
    input.translations ??
    (current.translations as CreateCategoryPayload["translations"]);
  const legacy = syncCategoryLegacyFields(translations);
  const rows = await db
    .update(categories)
    .set({
      slug: input.slug ?? current.slug,
      parentId: input.parentId ?? current.parentId,
      imageUrl: input.imageUrl ?? current.imageUrl,
      sortOrder: input.sortOrder ?? current.sortOrder,
      isActive: input.isActive ?? current.isActive,
      translations,
      name: legacy.name,
      description: legacy.description,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, id))
    .returning();

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to update category");
  }
  return mapAdminCategoryRow(row);
}

export async function deactivateAdminCategory(
  db: Database,
  id: string,
): Promise<void> {
  await db
    .update(categories)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(categories.id, id));
}

export async function categoryExistsBySlug(
  db: Database,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const conditions = [eq(categories.slug, slug)];
  if (excludeId !== undefined) {
    conditions.push(ne(categories.id, excludeId));
  }
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(...conditions))
    .limit(1);
  return rows.length > 0;
}

export async function countActiveProductsInCategory(
  db: Database,
  categoryId: string,
): Promise<number> {
  const result = await db
    .select({ value: count() })
    .from(products)
    .where(
      and(eq(products.categoryId, categoryId), eq(products.status, "active")),
    );
  return Number(result[0]?.value ?? 0);
}
