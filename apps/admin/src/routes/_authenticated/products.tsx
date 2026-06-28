import { createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export const Route = createFileRoute("/_authenticated/products")({
  component: ProductsPlaceholderPage,
});

function ProductsPlaceholderPage() {
  return (
    <>
      <PageHeader title="Products" description="Catalog management arrives in Phase 14." />
      <EmptyState
        title="Products CRUD coming soon"
        description="This scaffold includes navigation and API clients; list and edit flows ship next."
      />
    </>
  );
}
