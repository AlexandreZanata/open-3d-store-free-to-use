import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ProductForm } from "@/components/products/ProductForm";
import {
  productFormToPayload,
  productToFormState,
  validateProductForm,
} from "@/components/products/productFormState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  adminProductQueryKey,
  useAdminProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/hooks/useAdminProducts";
import { ApiError, getFieldErrors } from "@/lib/api/client";
import { fetchAdminProduct } from "@/lib/api/products";
import { formatApiErrorMessage } from "@/lib/utils";
import type { ProductFormState } from "@/components/products/productFormState";

export const Route = createFileRoute("/_authenticated/products/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData({
      queryKey: adminProductQueryKey(params.id),
      queryFn: () => fetchAdminProduct(params.id),
    }),
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const productQuery = useAdminProduct(id);
  const updateMutation = useUpdateProduct(id);
  const deleteMutation = useDeleteProduct();

  const [formState, setFormState] = useState<ProductFormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (productQuery.data) {
      setFormState(productToFormState(productQuery.data));
    }
  }, [productQuery.data]);

  async function handleSubmit() {
    if (!formState) return;
    const nextErrors = validateProductForm(formState);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    try {
      await updateMutation.mutateAsync(productFormToPayload(formState));
      setSavedMessage("Saved");
      window.setTimeout(() => setSavedMessage(null), 3000);
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 422) {
        setErrors(getFieldErrors(caught.problem));
        setSubmitError(caught.problem.detail);
      } else if (caught instanceof ApiError) {
        setSubmitError(formatApiErrorMessage(caught.problem.detail, caught.problem.title));
      } else {
        setSubmitError("Could not save product.");
      }
    }
  }

  async function handleDelete() {
    setSubmitError(null);
    try {
      await deleteMutation.mutateAsync(id);
      await navigate({ to: "/products", search: { page: 1, q: "", status: "", category: "" } });
    } catch (caught) {
      setSubmitError(
        caught instanceof ApiError
          ? formatApiErrorMessage(caught.problem.detail, caught.problem.title)
          : "Delete failed",
      );
      setConfirmDelete(false);
    }
  }

  if (productQuery.isLoading || !formState) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <>
      <PageHeader
        title="Edit product"
        description={formState.translations["pt-BR"].name}
        actions={savedMessage ? <span className="text-sm text-admin-accent">{savedMessage}</span> : null}
      />
      {submitError ? (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}
      <ProductForm
        state={formState}
        errors={errors}
        onChange={setFormState}
        onSubmit={() => void handleSubmit()}
        submitLabel="Save changes"
        isSubmitting={updateMutation.isPending}
        footer={
          <Card className="mt-8 w-full border-destructive/40">
            <h2 className="text-base font-semibold text-destructive">Danger zone</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Delete this product permanently when no orders reference it.
            </p>
            <Button className="mt-4" variant="danger" type="button" onClick={() => setConfirmDelete(true)}>
              Delete product
            </Button>
          </Card>
        }
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete product"
        message="This action cannot be undone unless the API rejects deletion due to existing orders."
        confirmLabel="Delete product"
        destructive
        isLoading={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
