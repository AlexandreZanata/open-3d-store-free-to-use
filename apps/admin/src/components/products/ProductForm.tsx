import type { MaterialType, PrintStatus } from "@print3d/shared-types";
import { MATERIAL_TYPES } from "@print3d/shared-types";
import { useState, type Dispatch, type SetStateAction } from "react";

import {
  ProductOptionsEditor,
} from "@/components/products/ProductOptionsEditor";
import {
  applySlugFromPtBrName,
  type ProductFormState,
} from "@/components/products/productFormState";
import { ProductPricingSection } from "@/components/products/ProductPricingSection";
import { ModelUploadField } from "@/components/uploads/ModelUploadField";
import { FileUploadField } from "@/components/uploads/FileUploadField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { adminTokens } from "@/lib/admin-tokens";
import { useAdminCategories } from "@/hooks/useAdminCategories";

const materials: MaterialType[] = [...MATERIAL_TYPES];
const statuses: PrintStatus[] = ["active", "out_of_stock", "discontinued"];
const localeTabs = [
  { id: "pt-BR", label: "PT-BR" },
  { id: "en", label: "EN" },
] as const;

type ProductFormProps = {
  state: ProductFormState;
  errors: Record<string, string>;
  onChange: Dispatch<SetStateAction<ProductFormState>>;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
  footer?: React.ReactNode;
};

export function ProductForm({
  state,
  errors,
  onChange,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  footer,
}: ProductFormProps) {
  const categoriesQuery = useAdminCategories();
  const categories = categoriesQuery.data?.data ?? [];
  const [activeLocale, setActiveLocale] = useState<(typeof localeTabs)[number]["id"]>("pt-BR");

  function patch(patchValue: Partial<ProductFormState>) {
    onChange((prev) => applySlugFromPtBrName({ ...prev, ...patchValue }));
  }

  function patchTranslation(locale: "en" | "pt-BR", field: "name" | "shortDescription" | "description", value: string) {
    onChange((prev) => {
      const next = {
        ...prev,
        translations: {
          ...prev.translations,
          [locale]: { ...prev.translations[locale], [field]: value },
        },
      };
      return locale === "pt-BR" ? applySlugFromPtBrName(next) : next;
    });
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
        <h2 className={adminTokens.sectionTitle}>Basics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Slug"
            value={state.slug}
            onChange={(event) => patch({ slug: event.target.value, slugManual: true })}
            error={errors.slug}
          />
          <Select
            label="Category"
            value={state.categoryId}
            onChange={(event) => patch({ categoryId: event.target.value })}
            error={errors.categoryId}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.translations["pt-BR"].name}
              </option>
            ))}
          </Select>
          <Select label="Material" value={state.material} onChange={(event) => patch({ material: event.target.value as MaterialType })}>
            {materials.map((material) => (
              <option key={material} value={material}>{material}</option>
            ))}
          </Select>
          <Select label="Status" value={state.status} onChange={(event) => patch({ status: event.target.value as PrintStatus })}>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
        </div>
      </Card>

      <ProductPricingSection
        state={state}
        errors={errors}
        onPatch={(patchValue) => patch(patchValue)}
      />

      <Card className="space-y-4">
        <h2 className={adminTokens.sectionTitle}>Media</h2>
        <FileUploadField kind="thumbnail" label="Thumbnail URL" value={state.thumbnailUrl} onChange={(url) => patch({ thumbnailUrl: url })} error={errors.thumbnailUrl} />
        <ModelUploadField
          label="3D model URL"
          value={state.modelFileUrl}
          onChange={(url) => patch({ modelFileUrl: url })}
          onPartsDetected={(parts) => {
            const totalWeight = parts.reduce((sum, part) => sum + (part.weightGrams ?? 0), 0);
            patch({
              modelParts: parts,
              weightGrams: totalWeight > 0 ? String(Math.round(totalWeight)) : state.weightGrams,
            });
          }}
        />
        {state.modelParts.length > 0 ? (
          <ul className="rounded-lg border border-hairline divide-y divide-hairline text-sm">
            {state.modelParts.map((part) => (
              <li key={part.id} className="flex justify-between gap-4 px-3 py-2">
                <span className="font-medium">{part.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {part.weightGrams != null ? `${part.weightGrams} g` : "—"}
                  {part.volumeCm3 != null ? ` · ${part.volumeCm3.toFixed(1)} cm³` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={adminTokens.label}>Gallery images</h3>
            <Button type="button" variant="secondary" onClick={() => patch({ imageUrls: [...state.imageUrls, ""] })}>Add image</Button>
          </div>
          {state.imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <FileUploadField kind="gallery" label={`Gallery ${index + 1}`} value={url} onChange={(next) => {
                const imageUrls = [...state.imageUrls];
                imageUrls[index] = next;
                patch({ imageUrls });
              }} />
              <Button type="button" variant="ghost" onClick={() => patch({ imageUrls: state.imageUrls.filter((_, i) => i !== index) })}>Remove</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <ProductOptionsEditor value={state.options} onChange={(options) => patch({ options })} errors={errors} />
      </Card>

      <Card>
        <h2 className={adminTokens.sectionTitle}>Translations</h2>
        <Tabs tabs={[...localeTabs]} activeId={activeLocale} onChange={(id) => setActiveLocale(id as typeof activeLocale)}>
          <div className="space-y-4">
            <Input label="Name" value={state.translations[activeLocale].name} onChange={(event) => patchTranslation(activeLocale, "name", event.target.value)} error={errors[`translations.${activeLocale}.name`]} />
            <Input label="Short description" value={state.translations[activeLocale].shortDescription} onChange={(event) => patchTranslation(activeLocale, "shortDescription", event.target.value)} error={errors[`translations.${activeLocale}.shortDescription`]} />
            <Textarea label="Description" value={state.translations[activeLocale].description} onChange={(event) => patchTranslation(activeLocale, "description", event.target.value)} error={errors[`translations.${activeLocale}.description`]} />
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
