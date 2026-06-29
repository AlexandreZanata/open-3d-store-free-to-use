import { useQuery } from "@tanstack/react-query";

import { fetchAdminOrder, fetchAdminOrders, type AdminOrderQuery } from "@/lib/api/orders";

function stableOrderQueryKey(params: AdminOrderQuery = {}) {
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    from: params.from ?? "",
    to: params.to ?? "",
  } as const;
}

export const adminOrdersQueryKey = (params: AdminOrderQuery = {}) =>
  ["admin", "orders", stableOrderQueryKey(params)] as const;

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
