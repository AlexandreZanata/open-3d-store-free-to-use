import { createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export const Route = createFileRoute("/_authenticated/categories")({
  component: CategoriesPlaceholderPage,
});

function CategoriesPlaceholderPage() {
  return (
    <>
      <PageHeader title="Categories" description="Category management arrives in Phase 14." />
      <EmptyState
        title="Categories CRUD coming soon"
        description="Use the dashboard stats until catalog editors are wired."
      />
    </>
  );
}
