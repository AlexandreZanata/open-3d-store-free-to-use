import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { ProductForm } from "@/components/products/ProductForm";
import {
  createEmptyProductForm,
  productFormToPayload,
  validateProductForm,
} from "@/components/products/productFormState";
import { PageBackLink } from "@/components/ui/PageBackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { useCreateProduct } from "@/hooks/useAdminProducts";
import { ApiError, getFieldErrors } from "@/lib/api/client";
import { formatApiErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/products/new")({
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();
  const [formState, setFormState] = useState(createEmptyProductForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    const nextErrors = validateProductForm(formState);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    try {
      const product = await createMutation.mutateAsync(productFormToPayload(formState));
      await navigate({ to: "/products/$id", params: { id: product.id } });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 422) {
        setErrors(getFieldErrors(caught.problem));
        setSubmitError(caught.problem.detail);
      } else if (caught instanceof ApiError) {
        setSubmitError(formatApiErrorMessage(caught.problem.detail, caught.problem.title));
      } else {
        setSubmitError("Could not create product.");
      }
    }
  }

  return (
    <>
      <PageHeader
        back={
          <PageBackLink
            to="/products"
            search={{ page: 1, q: "", status: "", category: "" }}
            label="Back to products"
          />
        }
        title="Create product"
        description="Add a bilingual catalog product."
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
        submitLabel="Create product"
        isSubmitting={createMutation.isPending}
      />
    </>
  );
}
