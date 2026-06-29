import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Card } from "@/components/ui/Card";
import { SystemStatusPanel } from "@/components/dashboard/SystemStatusPanel";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAdminAuth } from "@/auth/useAdminAuth";
import { fetchAdminCategories } from "@/lib/api/categories";
import { fetchAdminOrders } from "@/lib/api/orders";
import { fetchAdminProducts } from "@/lib/api/products";
import { daysAgoIso, startOfTodayIso } from "@/lib/orderDisplay";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAdminAuth();

  const activeProductsQuery = useQuery({
    queryKey: ["admin", "dashboard", "active-products"],
    queryFn: () => fetchAdminProducts({ page: 1, limit: 1, status: "active" }),
  });
  const ordersTodayQuery = useQuery({
    queryKey: ["admin", "dashboard", "orders-today"],
    queryFn: () => fetchAdminOrders({ page: 1, limit: 1, from: startOfTodayIso() }),
  });
  const ordersWeekQuery = useQuery({
    queryKey: ["admin", "dashboard", "orders-week"],
    queryFn: () => fetchAdminOrders({ page: 1, limit: 1, from: daysAgoIso(7) }),
  });
  const categoriesQuery = useQuery({
    queryKey: ["admin", "dashboard", "categories"],
    queryFn: fetchAdminCategories,
  });

  const isLoading =
    activeProductsQuery.isLoading ||
    ordersTodayQuery.isLoading ||
    ordersWeekQuery.isLoading ||
    categoriesQuery.isLoading;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back${user?.email ? `, ${user.email}` : ""}.`}
      />

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active products"
              value={activeProductsQuery.data?.pagination.total ?? 0}
            />
            <StatCard label="Orders today" value={ordersTodayQuery.data?.pagination.total ?? 0} />
            <StatCard
              label="Orders this week"
              value={ordersWeekQuery.data?.pagination.total ?? 0}
            />
            <StatCard label="Categories" value={categoriesQuery.data?.data.length ?? 0} />
          </div>
          <SystemStatusPanel />
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
