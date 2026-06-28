import type { AdminDataResponse, AdminPaginatedResponse } from "./admin.types.js";
import type { OrderLineItem } from "../order.types.js";

export type AdminOrderListItem = {
  id: string;
  itemCount: number;
  totalCents: number;
  totalDisplay: string;
  customerName: string | null;
  capturedAt: string;
};

export type AdminOrderDetail = {
  id: string;
  items: OrderLineItem[];
  customerName: string | null;
  customerNote: string | null;
  totalCents: number;
  totalDisplay: string;
  whatsappLink: string;
  capturedAt: string;
};

export type AdminOrderListResponse = AdminPaginatedResponse<AdminOrderListItem>;

export type AdminOrderDetailResponse = AdminDataResponse<AdminOrderDetail>;
