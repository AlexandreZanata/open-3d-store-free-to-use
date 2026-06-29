import { useMemo } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import {
  formatOrderDate,
  formatOrderDisplayId,
  ordersListLookbackFrom,
} from "@/lib/orderDisplay";
import { toTablePagination } from "@/lib/tablePagination";
import type { AdminOrderListItem } from "@print3d/shared-types";

type OrdersSearch = {
  page: number;
};

const orderColumns: DataTableColumn<AdminOrderListItem>[] = [
  {
    id: "order",
    header: "Order",
    cell: (order) => <span className="font-mono text-xs">{formatOrderDisplayId(order.id)}</span>,
  },
  {
    id: "date",
    header: "Date",
    cell: (order) => formatOrderDate(order.capturedAt),
  },
  {
    id: "items",
    header: "Items",
    cell: (order) => order.itemCount,
  },
  {
    id: "customer",
    header: "Customer",
    cell: (order) => order.customerName ?? "—",
  },
  {
    id: "total",
    header: "Total",
    align: "right",
    cellClassName: "font-medium",
    cell: (order) => order.totalDisplay,
  },
  {
    id: "actions",
    header: "Actions",
    align: "right",
    cell: (order) => (
      <Link to="/orders/$id" params={{ id: order.id }}>
        <Button variant="secondary">View</Button>
      </Link>
    ),
  },
];

export const Route = createFileRoute("/_authenticated/orders/")({
  validateSearch: (search: Record<string, never>): OrdersSearch => ({
    page: Number(search.page) > 0 ? Number(search.page) : 1,
  }),
  component: OrdersListPage,
});

function OrdersListPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const from = useMemo(() => ordersListLookbackFrom(), []);

  const ordersQuery = useAdminOrders({
    page: search.page,
    limit: 20,
    from,
  });

  const orders = ordersQuery.data?.data ?? [];
  const pagination = ordersQuery.data?.pagination;

  function goToPage(page: number) {
    void navigate({ to: "/orders", search: { page } });
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description="Read-only order captures from the storefront WhatsApp flow (last 30 days)."
      />

      {ordersQuery.isLoading ? <LoadingSpinner className="py-12" /> : null}

      {ordersQuery.isError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Could not load orders. Check the API connection and try again.
        </p>
      ) : null}

      {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Captured orders appear here after customers complete the WhatsApp checkout."
        />
      ) : null}

      {orders.length > 0 ? (
        <DataTable
          caption="Captured orders"
          columns={orderColumns}
          rows={orders}
          getRowKey={(order) => order.id}
          pagination={pagination ? toTablePagination(pagination) : null}
          onPageChange={goToPage}
        />
      ) : null}
    </>
  );
}
