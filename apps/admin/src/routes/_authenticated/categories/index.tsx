import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { AdminCategoryListItem } from "@print3d/shared-types";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAdminCategories, useDeleteCategory } from "@/hooks/useAdminCategories";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api/client";
import { formatApiErrorMessage } from "@/lib/utils";

const categoryColumns = (
  onDeactivate: (id: string) => void,
): DataTableColumn<AdminCategoryListItem>[] => [
  {
    id: "name",
    header: "Name (PT-BR)",
    cell: (category) => category.translations["pt-BR"].name,
  },
  {
    id: "slug",
    header: "Slug",
    cellClassName: "text-muted-foreground",
    cell: (category) => category.slug,
  },
  {
    id: "sort",
    header: "Sort",
    cell: (category) => category.sortOrder,
  },
  {
    id: "active",
    header: "Active",
    cell: (category) => (category.isActive ? "Yes" : "No"),
  },
  {
    id: "actions",
    header: "Actions",
    align: "right",
    cell: (category) => (
      <div className="flex justify-end gap-2">
        <Link to="/categories/$id" params={{ id: category.id }}>
          <Button variant="secondary">Edit</Button>
        </Link>
        {category.isActive ? (
          <Button variant="danger" onClick={() => onDeactivate(category.id)}>
            Deactivate
          </Button>
        ) : null}
      </div>
    ),
  },
];

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
        <DataTable
          caption="Product categories"
          columns={categoryColumns(setDeactivateId)}
          rows={categories}
          getRowKey={(category) => category.id}
        />
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
