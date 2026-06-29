import type { Product, ProductOption, ModelPart } from "@print3d/shared-types";

import type { SupportedLocale } from "../../../domain/value-objects/Locale.js";
import type { products } from "../../db/schema.js";
import {
  resolveCatalogText,
  type CatalogTranslations,
} from "./resolveTranslation.js";

type ProductRow = typeof products.$inferSelect;

export function mapProductRow(
  row: ProductRow,
  locale: SupportedLocale,
): Product {
  const translations = row.translations as CatalogTranslations;

  return {
    id: row.id,
    slug: row.slug,
    name: resolveCatalogText(translations, locale, "name", row.name),
    description: resolveCatalogText(
      translations,
      locale,
      "description",
      row.description,
    ),
    shortDescription: resolveCatalogText(
      translations,
      locale,
      "shortDescription",
      row.shortDescription,
    ),
    categoryId: row.categoryId,
    basePrice: row.basePrice,
    material: row.material,
    printTimeHours: row.printTimeHours,
    weightGrams: row.weightGrams,
    status: row.status,
    options: row.options as ProductOption[],
    modelFileUrl: row.modelFileUrl,
    modelParts: row.modelParts as ModelPart[],
    thumbnailUrl: row.thumbnailUrl,
    imageUrls: row.imageUrls as string[],
    tags: row.tags as string[],
  };
}
