import type { Category } from "@print3d/shared-types";

export interface ICategoryRepository {
  findAllActive(): Promise<Category[]>;
  findBySlug(slug: string): Promise<Category | null>;
}
