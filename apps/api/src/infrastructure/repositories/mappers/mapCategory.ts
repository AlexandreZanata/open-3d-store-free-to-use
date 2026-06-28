import type { Category } from "@print3d/shared-types";

import type { SupportedLocale } from "../../../domain/value-objects/Locale.js";
import type { categories } from "../../db/schema.js";
import {
  resolveCatalogText,
  type CatalogTranslations,
} from "./resolveTranslation.js";

type CategoryRow = typeof categories.$inferSelect;

export function mapCategoryRow(
  row: CategoryRow,
  locale: SupportedLocale,
): Category {
  const translations = row.translations as CatalogTranslations;
  const description = resolveCatalogText(
    translations,
    locale,
    "description",
    row.description ?? "",
  );

  return {
    id: row.id,
    slug: row.slug,
    name: resolveCatalogText(translations, locale, "name", row.name),
    description: description === "" ? null : description,
    parentId: row.parentId,
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}
