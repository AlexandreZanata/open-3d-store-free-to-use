import type { AdminOrderDetail, AdminOrderListItem, OrderCapture } from "@print3d/shared-types";

import type {
  OrderDateRange,
  PaginatedResult,
  PaginationParams,
} from "./IProductRepository.js";

export interface IOrderCaptureRepository {
  save(orderCapture: OrderCapture, totalCents: number): Promise<void>;
  findMany(
    pagination: PaginationParams,
    dateRange?: OrderDateRange,
  ): Promise<PaginatedResult<AdminOrderListItem>>;
  findById(id: string): Promise<AdminOrderDetail | null>;
}
