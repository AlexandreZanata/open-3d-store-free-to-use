import type { AdminProductListItem } from "@print3d/shared-types";

export type AdminProductDto = AdminProductListItem;

export function toAdminProductDto(product: AdminProductListItem): AdminProductDto {
  return product;
}
