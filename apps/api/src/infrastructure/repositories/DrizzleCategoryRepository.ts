import { asc, eq } from "drizzle-orm";

import type { ICategoryRepository } from "../../domain/repositories/ICategoryRepository.js";
import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { Category } from "@print3d/shared-types";
import type { Database } from "../db/client.js";
import { categories } from "../db/schema.js";
import { mapCategoryRow } from "./mappers/mapCategory.js";

export class DrizzleCategoryRepository implements ICategoryRepository {
  constructor(private readonly db: Database) {}

  async findAllActive(locale: SupportedLocale): Promise<Category[]> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));

    return rows.map((row) => mapCategoryRow(row, locale));
  }

  async findBySlug(
    slug: string,
    locale: SupportedLocale,
  ): Promise<Category | null> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    const row = rows[0];
    return row ? mapCategoryRow(row, locale) : null;
  }
}
