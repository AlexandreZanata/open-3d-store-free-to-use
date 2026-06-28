import type {
  AdminOrderDetail,
  AdminOrderListResponse,
} from "@print3d/shared-types";

import type { IOrderCaptureRepository } from "../../../domain/repositories/IOrderCaptureRepository.js";
import type {
  OrderDateRange,
  PaginationParams,
} from "../../../domain/repositories/IProductRepository.js";
import { ResourceNotFoundError } from "../../errors/ApplicationErrors.js";
import {
  toAdminOrderDetailDto,
  toAdminOrderListDto,
} from "../../dtos/AdminOrderDto.js";

export type ListOrderCapturesInput = {
  pagination: PaginationParams;
  dateRange?: OrderDateRange | undefined;
};

export class ListOrderCaptures {
  constructor(private readonly orders: IOrderCaptureRepository) {}

  async execute(input: ListOrderCapturesInput): Promise<AdminOrderListResponse> {
    const result = await this.orders.findMany(input.pagination, input.dateRange);
    return {
      data: result.data.map((item) => toAdminOrderListDto(item)),
      pagination: result.pagination,
    };
  }
}

export type GetOrderCaptureInput = {
  orderId: string;
};

export class GetOrderCapture {
  constructor(private readonly orders: IOrderCaptureRepository) {}

  async execute(input: GetOrderCaptureInput): Promise<AdminOrderDetail> {
    const order = await this.orders.findById(input.orderId);
    if (order === null) {
      throw new ResourceNotFoundError("Order", input.orderId);
    }
    return toAdminOrderDetailDto(order);
  }
}
