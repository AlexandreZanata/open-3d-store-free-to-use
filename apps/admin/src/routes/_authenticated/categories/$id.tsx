import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type SetStateAction } from "react";

import { CategoryForm } from "@/components/categories/CategoryForm";
import {
  categoryFormToPayload,
  categoryToFormState,
  validateCategoryForm,
  type CategoryFormState,
} from "@/components/categories/categoryFormState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageBackLink } from "@/components/ui/PageBackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/hooks/useToast";
import {
  adminCategoryQueryKey,
  useAdminCategory,
  useUpdateCategory,
} from "@/hooks/useAdminCategories";
import { ApiError, getFieldErrors } from "@/lib/api/client";
import { fetchAdminCategory } from "@/lib/api/categories";
import { formatApiErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/categories/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData({
      queryKey: adminCategoryQueryKey(params.id),
      queryFn: () => fetchAdminCategory(params.id),
    }),
  component: EditCategoryPage,
});

function EditCategoryPage() {
  const { id } = Route.useParams();
  const toast = useToast();
  const categoryQuery = useAdminCategory(id);
  const updateMutation = useUpdateCategory(id);

  const [formState, setFormState] = useState<CategoryFormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setFormState(null);
  }, [id]);

  useEffect(() => {
    if (categoryQuery.data && formState === null) {
      setFormState(categoryToFormState(categoryQuery.data));
    }
  }, [categoryQuery.data, formState]);

  function handleFormChange(updater: SetStateAction<CategoryFormState>) {
    setFormState((prev) => {
      if (prev === null) {
        return prev;
      }
      return typeof updater === "function" ? updater(prev) : updater;
    });
  }

  async function handleSubmit() {
    if (!formState) return;
    const nextErrors = validateCategoryForm(formState);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    try {
      const saved = await updateMutation.mutateAsync(categoryFormToPayload(formState));
      setFormState(categoryToFormState(saved));
      toast.success("Saved");
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 422) {
        setErrors(getFieldErrors(caught.problem));
        setSubmitError(caught.problem.detail);
        toast.error(caught.problem.detail);
      } else if (caught instanceof ApiError) {
        const message = formatApiErrorMessage(caught.problem.detail, caught.problem.title);
        setSubmitError(message);
        toast.error(message);
      } else {
        setSubmitError("Could not save category.");
        toast.error("Could not save category.");
      }
    }
  }

  if (categoryQuery.isLoading || !formState) {
    return <LoadingSpinner className="py-12" />;
  }

  return (
    <>
      <PageHeader
        back={<PageBackLink to="/categories" label="Back to categories" />}
        title="Edit category"
        description={formState.translations["pt-BR"].name}
      />
      {submitError ? (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {submitError}
        </p>
      ) : null}
      <CategoryForm
        state={formState}
        errors={errors}
        categoryId={id}
        onChange={handleFormChange}
        onSubmit={() => void handleSubmit()}
        submitLabel="Save changes"
        isSubmitting={updateMutation.isPending}
      />
    </>
  );
}
