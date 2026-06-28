import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { adminOrderQueryKey, useAdminOrder } from "@/hooks/useAdminOrders";
import { fetchAdminOrder } from "@/lib/api/orders";
import { formatBrlCents } from "@/lib/money";
import { formatOrderDate, formatOrderDisplayId } from "@/lib/orderDisplay";

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
        title={`Order ${formatOrderDisplayId(order.id)}`}
        description={`Captured ${formatOrderDate(order.capturedAt)}`}
        actions={
          <Link to="/orders" search={{ page: 1 }}>
            <Button variant="secondary">Back to orders</Button>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">Line items</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <caption className="sr-only">Order line items</caption>
              <thead className="border-b border-hairline">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left font-medium">Product</th>
                  <th scope="col" className="px-2 py-2 text-left font-medium">Qty</th>
                  <th scope="col" className="px-2 py-2 text-left font-medium">Options</th>
                  <th scope="col" className="px-2 py-2 text-right font-medium">Unit price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={`${item.productId}-${index}`} className="border-b border-hairline last:border-0">
                    <td className="px-2 py-2">{item.productName}</td>
                    <td className="px-2 py-2">{item.quantity}</td>
                    <td className="px-2 py-2 text-muted-foreground">
                      {Object.entries(item.selectedOptions)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-2 py-2 text-right">{formatBrlCents(item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
