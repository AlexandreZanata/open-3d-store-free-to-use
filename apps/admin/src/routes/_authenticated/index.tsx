import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAdminAuth } from "@/auth/useAdminAuth";
import { fetchAdminCategories } from "@/lib/api/categories";
import { fetchAdminOrders } from "@/lib/api/orders";
import { fetchAdminProducts } from "@/lib/api/products";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAdminAuth();
  const productsQuery = useQuery({
    queryKey: ["admin", "products", "count"],
    queryFn: () => fetchAdminProducts({ page: 1, limit: 1 }),
  });
  const ordersQuery = useQuery({
    queryKey: ["admin", "orders", "count"],
    queryFn: () => fetchAdminOrders({ page: 1, limit: 1 }),
  });
  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories", "count"],
    queryFn: fetchAdminCategories,
  });

  const isLoading = productsQuery.isLoading || ordersQuery.isLoading || categoriesQuery.isLoading;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back${user?.email ? `, ${user.email}` : ""}.`}
      />

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Products" value={productsQuery.data?.pagination.total ?? 0} />
          <StatCard label="Orders" value={ordersQuery.data?.pagination.total ?? 0} />
          <StatCard label="Categories" value={categoriesQuery.data?.data.length ?? 0} />
        </div>
      )}
    </>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
    </Card>
  );
}
