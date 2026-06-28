import type { Category } from "@print3d/shared-types";

import type { SupportedLocale } from "../value-objects/Locale.js";

export interface ICategoryRepository {
  findAllActive(locale: SupportedLocale): Promise<Category[]>;
  findBySlug(slug: string, locale: SupportedLocale): Promise<Category | null>;
}
