import { createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersPlaceholderPage,
});

function OrdersPlaceholderPage() {
  return (
    <>
      <PageHeader title="Orders" description="Order review arrives in Phase 15." />
      <EmptyState
        title="Orders view coming soon"
        description="Read-only order detail and filters will be added in the next admin phases."
      />
    </>
  );
}
