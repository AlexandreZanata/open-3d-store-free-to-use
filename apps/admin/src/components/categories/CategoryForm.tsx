import { useState, type Dispatch, type SetStateAction } from "react";

import {
  applySlugFromPtBrName,
  type CategoryFormState,
} from "@/components/categories/categoryFormState";
import { FileUploadField } from "@/components/uploads/FileUploadField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { adminTokens } from "@/lib/admin-tokens";
import { useAdminCategories } from "@/hooks/useAdminCategories";

const localeTabs = [
  { id: "pt-BR", label: "PT-BR" },
  { id: "en", label: "EN" },
] as const;

type CategoryFormProps = {
  state: CategoryFormState;
  errors: Record<string, string>;
  categoryId?: string;
  onChange: Dispatch<SetStateAction<CategoryFormState>>;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
  footer?: React.ReactNode;
};

export function CategoryForm({
  state,
  errors,
  categoryId,
  onChange,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  footer,
}: CategoryFormProps) {
  const categoriesQuery = useAdminCategories();
  const categories = (categoriesQuery.data?.data ?? []).filter((c) => c.id !== categoryId);
  const [activeLocale, setActiveLocale] = useState<(typeof localeTabs)[number]["id"]>("pt-BR");

  function patch(patchValue: Partial<CategoryFormState>) {
    onChange((prev) => applySlugFromPtBrName({ ...prev, ...patchValue }));
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Card className="space-y-4">
        <h2 className={adminTokens.sectionTitle}>Category details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Slug" value={state.slug} onChange={(event) => patch({ slug: event.target.value, slugManual: true })} error={errors.slug} />
          <Input label="Sort order" type="number" value={state.sortOrder} onChange={(event) => patch({ sortOrder: event.target.value })} />
          <Select label="Parent category" value={state.parentId} onChange={(event) => patch({ parentId: event.target.value })}>
            <option value="">None</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.translations["pt-BR"].name}</option>
            ))}
          </Select>
          <label className="flex items-center gap-2 pt-6 text-sm">
            <input type="checkbox" checked={state.isActive} onChange={(event) => patch({ isActive: event.target.checked })} />
            Active
          </label>
        </div>
        <FileUploadField kind="thumbnail" label="Image URL" value={state.imageUrl} onChange={(url) => patch({ imageUrl: url })} />
      </Card>

      <Card>
        <h2 className={adminTokens.sectionTitle}>Translations</h2>
        <Tabs tabs={[...localeTabs]} activeId={activeLocale} onChange={(id) => setActiveLocale(id as typeof activeLocale)}>
          <div className="space-y-4">
            <Input
              label="Name"
              value={state.translations[activeLocale].name}
              onChange={(event) => {
                const next = {
                  ...state,
                  translations: {
                    ...state.translations,
                    [activeLocale]: { ...state.translations[activeLocale], name: event.target.value },
                  },
                };
                onChange(activeLocale === "pt-BR" ? applySlugFromPtBrName(next) : next);
              }}
              error={errors[`translations.${activeLocale}.name`]}
            />
            <Textarea
              label="Description"
              value={state.translations[activeLocale].description ?? ""}
              onChange={(event) =>
                patch({
                  translations: {
                    ...state.translations,
                    [activeLocale]: { ...state.translations[activeLocale], description: event.target.value },
                  },
                })
              }
            />
          </div>
        </Tabs>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : submitLabel}</Button>
        {footer}
      </div>
    </form>
  );
}
