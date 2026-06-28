import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { formatOrderDate, formatOrderDisplayId, daysAgoIso } from "@/lib/orderDisplay";

type OrdersSearch = {
  page: number;
};

export const Route = createFileRoute("/_authenticated/orders/")({
  validateSearch: (search: Record<string, never>): OrdersSearch => ({
    page: Number(search.page) > 0 ? Number(search.page) : 1,
  }),
  component: OrdersListPage,
});

function OrdersListPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const from = daysAgoIso(30);

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

      {!ordersQuery.isLoading && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Captured orders appear here after customers complete the WhatsApp checkout."
        />
      ) : null}

      {orders.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Captured orders</caption>
            <thead className="border-b border-hairline bg-surface-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">
                  Order
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium">
                  Items
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium">
                  Customer
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{formatOrderDisplayId(order.id)}</td>
                  <td className="px-4 py-3">{formatOrderDate(order.capturedAt)}</td>
                  <td className="px-4 py-3">{order.itemCount}</td>
                  <td className="px-4 py-3">{order.customerName ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">{order.totalDisplay}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/orders/$id" params={{ id: order.id }}>
                      <Button variant="secondary">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => goToPage(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
