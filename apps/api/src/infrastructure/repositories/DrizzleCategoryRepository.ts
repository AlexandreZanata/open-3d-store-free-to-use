import { asc, eq } from "drizzle-orm";

import type {
  AdminCategoryListItem,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@print3d/shared-types";

import type { ICategoryRepository } from "../../domain/repositories/ICategoryRepository.js";
import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import type { Database } from "../db/client.js";
import { categories } from "../db/schema.js";
import {
  categoryExistsBySlug,
  countActiveProductsInCategory,
  createAdminCategory,
  deactivateAdminCategory,
  updateAdminCategory,
} from "./categoryAdminPersistence.js";
import { mapCategoryRow } from "./mappers/mapCategory.js";
import { mapAdminCategoryRow } from "./mappers/mapAdminCatalog.js";

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

  async create(input: CreateCategoryPayload): Promise<AdminCategoryListItem> {
    return createAdminCategory(this.db, input);
  }

  async update(
    id: string,
    input: UpdateCategoryPayload,
  ): Promise<AdminCategoryListItem> {
    return updateAdminCategory(this.db, id, input);
  }

  async deactivate(id: string): Promise<void> {
    return deactivateAdminCategory(this.db, id);
  }

  async findAllAdmin(): Promise<AdminCategoryListItem[]> {
    const rows = await this.db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder));
    return rows.map((row) => mapAdminCategoryRow(row));
  }

  async findByIdAdmin(id: string): Promise<AdminCategoryListItem | null> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    const row = rows[0];
    return row ? mapAdminCategoryRow(row) : null;
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    return categoryExistsBySlug(this.db, slug, excludeId);
  }

  async countActiveProducts(categoryId: string): Promise<number> {
    return countActiveProductsInCategory(this.db, categoryId);
  }
}
