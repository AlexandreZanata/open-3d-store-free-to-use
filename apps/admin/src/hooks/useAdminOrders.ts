import { useQuery } from "@tanstack/react-query";

import { fetchAdminOrder, fetchAdminOrders, type AdminOrderQuery } from "@/lib/api/orders";

export const adminOrdersQueryKey = (params: AdminOrderQuery = {}) =>
  ["admin", "orders", params] as const;

export const adminOrderQueryKey = (id: string) => ["admin", "order", id] as const;

export function useAdminOrders(params: AdminOrderQuery = {}) {
  return useQuery({
    queryKey: adminOrdersQueryKey(params),
    queryFn: () => fetchAdminOrders(params),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: adminOrderQueryKey(id),
    queryFn: () => fetchAdminOrder(id),
    enabled: id.length > 0,
  });
}
