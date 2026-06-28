import type { AdminCategoryListItem } from "@print3d/shared-types";

export type AdminCategoryDto = AdminCategoryListItem;

export function toAdminCategoryDto(
  category: AdminCategoryListItem,
): AdminCategoryDto {
  return category;
}
