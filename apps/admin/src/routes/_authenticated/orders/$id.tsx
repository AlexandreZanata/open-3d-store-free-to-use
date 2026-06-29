import { createFileRoute } from "@tanstack/react-router";

import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageBackLink } from "@/components/ui/PageBackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { adminOrderQueryKey, useAdminOrder } from "@/hooks/useAdminOrders";
import { fetchAdminOrder } from "@/lib/api/orders";
import { formatBrlCents } from "@/lib/money";
import { formatOrderDate, formatOrderDisplayId } from "@/lib/orderDisplay";
import type { AdminOrderDetail } from "@print3d/shared-types";

type LineItem = AdminOrderDetail["items"][number];

const lineItemColumns: DataTableColumn<LineItem>[] = [
  {
    id: "product",
    header: "Product",
    cell: (item) => item.productName,
  },
  {
    id: "qty",
    header: "Qty",
    cell: (item) => item.quantity,
  },
  {
    id: "options",
    header: "Options",
    cellClassName: "text-muted-foreground",
    cell: (item) =>
      Object.entries(item.selectedOptions)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ") || "—",
  },
  {
    id: "unitPrice",
    header: "Unit price",
    align: "right",
    cell: (item) => formatBrlCents(item.unitPrice),
  },
];

export const Route = createFileRoute("/_authenticated/orders/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData({
      queryKey: adminOrderQueryKey(params.id),
      queryFn: () => fetchAdminOrder(params.id),
    }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const orderQuery = useAdminOrder(id);

  if (orderQuery.isLoading || !orderQuery.data) {
    return <LoadingSpinner className="py-12" />;
  }

  const order = orderQuery.data;

  return (
    <>
      <PageHeader
        back={<PageBackLink to="/orders" search={{ page: 1 }} label="Back to orders" />}
        title={`Order ${formatOrderDisplayId(order.id)}`}
        description={`Captured ${formatOrderDate(order.capturedAt)}`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Line items</h2>
          <div className="mt-4">
            <DataTable
              caption="Order line items"
              columns={lineItemColumns}
              rows={order.items}
              getRowKey={(item, index) => `${item.productId}-${index}`}
              density="compact"
              className="border-0"
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-base font-semibold text-foreground">Customer</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd>{order.customerName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Note</dt>
                <dd>{order.customerNote ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-semibold">{order.totalDisplay}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-foreground">WhatsApp</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Original checkout link sent to the customer.
            </p>
            <a
              href={order.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm font-medium text-foreground underline"
            >
              Open WhatsApp message
            </a>
          </Card>
        </div>
      </div>
    </>
  );
}
