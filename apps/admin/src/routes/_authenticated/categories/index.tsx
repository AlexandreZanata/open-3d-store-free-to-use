import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAdminCategories, useDeleteCategory } from "@/hooks/useAdminCategories";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/client";
import { formatApiErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/categories/")({
  component: CategoriesListPage,
});

function CategoriesListPage() {
  const categoriesQuery = useAdminCategories();
  const deleteMutation = useDeleteCategory();
  const toast = useToast();
  const categories = categoriesQuery.data?.data ?? [];

  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function confirmDeactivate() {
    if (!deactivateId) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(deactivateId);
      toast.success("Category deactivated");
      setDeactivateId(null);
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? formatApiErrorMessage(caught.problem.detail, caught.problem.title)
          : "Deactivate failed";
      setActionError(message);
      toast.error(message);
    }
  }

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organize products into bilingual categories."
        actions={
          <Link to="/categories/new">
            <Button>Create category</Button>
          </Link>
        }
      />

      {categoriesQuery.isLoading ? <LoadingSpinner className="py-12" /> : null}

      {!categoriesQuery.isLoading && categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create a category before adding products."
          action={
            <Link to="/categories/new">
              <Button>Create category</Button>
            </Link>
          }
        />
      ) : null}

      {categories.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="min-w-full text-sm">
            <thead className="border-b border-hairline bg-surface-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name (PT-BR)</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Sort</th>
                <th className="px-4 py-3 text-left font-medium">Active</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3">{category.translations["pt-BR"].name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                  <td className="px-4 py-3">{category.sortOrder}</td>
                  <td className="px-4 py-3">{category.isActive ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to="/categories/$id" params={{ id: category.id }}>
                        <Button variant="secondary">Edit</Button>
                      </Link>
                      {category.isActive ? (
                        <Button variant="danger" onClick={() => setDeactivateId(category.id)}>
                          Deactivate
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ConfirmDialog
        open={deactivateId !== null}
        title="Deactivate category"
        message="Inactive categories are hidden from the public catalog. Active products may block deactivation."
        confirmLabel="Deactivate"
        destructive
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          setDeactivateId(null);
          setActionError(null);
        }}
        onConfirm={() => void confirmDeactivate()}
      />
      {actionError ? <p className="mt-2 text-sm text-destructive">{actionError}</p> : null}
    </>
  );
}
