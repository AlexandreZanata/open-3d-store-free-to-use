import type {
  AdminCategoryListItem,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@print3d/shared-types";

import type { SupportedLocale } from "../value-objects/Locale.js";

export interface ICategoryRepository {
  findAllActive(locale: SupportedLocale): Promise<Category[]>;
  findBySlug(slug: string, locale: SupportedLocale): Promise<Category | null>;
  create(input: CreateCategoryPayload): Promise<AdminCategoryListItem>;
  update(id: string, input: UpdateCategoryPayload): Promise<AdminCategoryListItem>;
  deactivate(id: string): Promise<void>;
  findAllAdmin(): Promise<AdminCategoryListItem[]>;
  findByIdAdmin(id: string): Promise<AdminCategoryListItem | null>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  countActiveProducts(categoryId: string): Promise<number>;
}
