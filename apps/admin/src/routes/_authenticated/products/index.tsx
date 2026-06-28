import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { PrintStatus } from "@print3d/shared-types";

import { ProductsFilters, ProductsTable } from "@/components/products/ProductsListPanel";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useAdminProducts";
import { ApiError } from "@/lib/api/client";
import { formatApiErrorMessage } from "@/lib/utils";

type ProductsSearch = {
  page: number;
  q: string;
  status: PrintStatus | "";
  category: string;
};

export const Route = createFileRoute("/_authenticated/products/")({
  validateSearch: (search: Record<string, never>): ProductsSearch => ({
    page: Number(search.page) > 0 ? Number(search.page) : 1,
    q: typeof search.q === "string" ? search.q : "",
    status: typeof search.status === "string" ? (search.status as PrintStatus | "") : "",
    category: typeof search.category === "string" ? search.category : "",
  }),
  component: ProductsListPage,
});

function ProductsListPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const categoriesQuery = useAdminCategories();
  const categoryItems = categoriesQuery.data?.data;
  const categories = useMemo(() => categoryItems ?? [], [categoryItems]);
  const filterCategories = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.translations["pt-BR"].name,
  }));
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.translations["pt-BR"].name])),
    [categories],
  );

  const [draftQ, setDraftQ] = useState(search.q);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const productsQuery = useAdminProducts({
    page: search.page,
    limit: 20,
    q: search.q || undefined,
    status: search.status || undefined,
    category: search.category || undefined,
  });
  const deleteMutation = useDeleteProduct();

  const products = productsQuery.data?.data ?? [];
  const pagination = productsQuery.data?.pagination;

  function applyFilters(next: Partial<ProductsSearch>) {
    void navigate({
      to: "/products",
      search: { ...search, ...next, page: next.page ?? 1 },
    });
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (caught) {
      setDeleteError(
        caught instanceof ApiError
          ? formatApiErrorMessage(caught.problem.detail, caught.problem.title)
          : "Delete failed",
      );
    }
  }

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage catalog products, statuses, and bilingual content."
        actions={
          <Link to="/products/new">
            <Button>Create product</Button>
          </Link>
        }
      />

      <ProductsFilters
        draftQ={draftQ}
        status={search.status}
        category={search.category}
        categories={filterCategories}
        onDraftQChange={setDraftQ}
        onStatusChange={(status) => applyFilters({ status })}
        onCategoryChange={(category) => applyFilters({ category })}
        onApply={() => applyFilters({ q: draftQ })}
      />

      {productsQuery.isLoading ? <LoadingSpinner className="py-12" /> : null}

      {!productsQuery.isLoading && products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to populate the catalog."
          action={
            <Link to="/products/new">
              <Button>Create product</Button>
            </Link>
          }
        />
      ) : null}

      {products.length > 0 ? (
        <ProductsTable products={products} categoryMap={categoryMap} onDelete={setDeleteId} />
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1}
              onClick={() => applyFilters({ page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => applyFilters({ page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete product"
        message="This permanently removes the product when allowed. Orders referencing it may block deletion."
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          setDeleteId(null);
          setDeleteError(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
      {deleteError ? <p className="mt-2 text-sm text-destructive">{deleteError}</p> : null}
    </>
  );
}
