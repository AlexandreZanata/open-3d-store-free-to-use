import type {
  AdminOrderDetail,
  AdminOrderListItem,
} from "@print3d/shared-types";

export type AdminOrderListDto = AdminOrderListItem;
export type AdminOrderDetailDto = AdminOrderDetail;

export function toAdminOrderListDto(order: AdminOrderListItem): AdminOrderListDto {
  return order;
}

export function toAdminOrderDetailDto(
  order: AdminOrderDetail,
): AdminOrderDetailDto {
  return order;
}
