import type {
  AdminCategoryListItem,
  AdminProductListItem,
  CreateProductPayload,
  CreateCategoryPayload,
} from "@print3d/shared-types";
import { DEFAULT_LOCALE } from "@print3d/shared-types";

import type { categories, products } from "../../db/schema.js";

type ProductRow = typeof products.$inferSelect;
type CategoryRow = typeof categories.$inferSelect;

export function mapAdminProductRow(row: ProductRow): AdminProductListItem {
  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.categoryId,
    basePrice: row.basePrice,
    material: row.material,
    printTimeHours: row.printTimeHours,
    weightGrams: row.weightGrams,
    status: row.status,
    options: row.options as AdminProductListItem["options"],
    modelFileUrl: row.modelFileUrl,
    modelParts: row.modelParts as AdminProductListItem["modelParts"],
    thumbnailUrl: row.thumbnailUrl,
    imageUrls: row.imageUrls as string[],
    tags: row.tags as string[],
    translations: row.translations as CreateProductPayload["translations"],
    isFeatured: row.isFeatured,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAdminCategoryRow(row: CategoryRow): AdminCategoryListItem {
  return {
    id: row.id,
    slug: row.slug,
    parentId: row.parentId,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    translations: row.translations as CreateCategoryPayload["translations"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function syncProductLegacyFields(
  translations: CreateProductPayload["translations"],
): {
  name: string;
  description: string;
  shortDescription: string;
} {
  const primary = translations[DEFAULT_LOCALE];
  const fallback = translations.en;
  return {
    name: primary.name || fallback.name,
    description: primary.description || fallback.description,
    shortDescription: primary.shortDescription || fallback.shortDescription,
  };
}

export function syncCategoryLegacyFields(
  translations: CreateCategoryPayload["translations"],
): {
  name: string;
  description: string | null;
} {
  const primary = translations[DEFAULT_LOCALE];
  const fallback = translations.en;
  return {
    name: primary.name || fallback.name,
    description: primary.description ?? fallback.description ?? null,
  };
}
