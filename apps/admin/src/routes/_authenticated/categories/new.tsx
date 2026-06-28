import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { CategoryForm } from "@/components/categories/CategoryForm";
import {
  categoryFormToPayload,
  createEmptyCategoryForm,
  validateCategoryForm,
} from "@/components/categories/categoryFormState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useCreateCategory } from "@/hooks/useAdminCategories";
import { ApiError, getFieldErrors } from "@/lib/api/client";
import { formatApiErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/categories/new")({
  component: NewCategoryPage,
});

function NewCategoryPage() {
  const navigate = useNavigate();
  const createMutation = useCreateCategory();
  const [formState, setFormState] = useState(createEmptyCategoryForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    const nextErrors = validateCategoryForm(formState);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    try {
      const category = await createMutation.mutateAsync(categoryFormToPayload(formState));
      await navigate({ to: "/categories/$id", params: { id: category.id } });
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 422) {
        setErrors(getFieldErrors(caught.problem));
        setSubmitError(caught.problem.detail);
      } else if (caught instanceof ApiError) {
        setSubmitError(formatApiErrorMessage(caught.problem.detail, caught.problem.title));
      } else {
        setSubmitError("Could not create category.");
      }
    }
  }

  return (
    <>
      <PageHeader title="Create category" description="Add a bilingual catalog category." />
      {submitError ? (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}
      <CategoryForm
        state={formState}
        errors={errors}
        onChange={setFormState}
        onSubmit={() => void handleSubmit()}
        submitLabel="Create category"
        isSubmitting={createMutation.isPending}
      />
    </>
  );
}
