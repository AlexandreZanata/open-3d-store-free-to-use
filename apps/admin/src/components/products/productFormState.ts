import type {
  AdminProductDetail,
  CreateProductPayload,
  MaterialType,
  ModelPart,
  PrintStatus,
  ProductOption,
} from "@print3d/shared-types";

import { centsToReaisInput, reaisToCents } from "@/lib/money";
import { printTimeHoursToStoredHours, parsePrintTimeHoursInput } from "@/lib/prepriceCalculator";
import { slugify } from "@/lib/slugify";
import { validateProductOptions } from "@/components/products/productOptionValidation";

export type ProductFormState = {
  slug: string;
  slugManual: boolean;
  categoryId: string;
  basePriceReais: string;
  material: MaterialType;
  printTimeHours: string;
  weightGrams: string;
  status: PrintStatus;
  options: ProductOption[];
  modelFileUrl: string;
  modelParts: ModelPart[];
  thumbnailUrl: string;
  imageUrls: string[];
  tags: string;
  translations: CreateProductPayload["translations"];
};

export function createEmptyProductForm(): ProductFormState {
  return {
    slug: "",
    slugManual: false,
    categoryId: "",
    basePriceReais: "",
    material: "PETG_HF",
    printTimeHours: "0",
    weightGrams: "0",
    status: "active",
    options: [],
    modelFileUrl: "",
    modelParts: [],
    thumbnailUrl: "",
    imageUrls: [],
    tags: "",
    translations: {
      en: { name: "", description: "", shortDescription: "" },
      "pt-BR": { name: "", description: "", shortDescription: "" },
    },
  };
}

export function productToFormState(product: AdminProductDetail): ProductFormState {
  return {
    slug: product.slug,
    slugManual: true,
    categoryId: product.categoryId,
    basePriceReais: centsToReaisInput(product.basePrice),
    material: product.material,
    printTimeHours: String(product.printTimeHours),
    weightGrams: String(product.weightGrams),
    status: product.status,
    options: product.options,
    modelFileUrl: product.modelFileUrl ?? "",
    modelParts: product.modelParts ?? [],
    thumbnailUrl: product.thumbnailUrl,
    imageUrls: product.imageUrls.length > 0 ? product.imageUrls : [],
    tags: product.tags.join(", "),
    translations: product.translations,
  };
}

export function validateProductForm(state: ProductFormState): Record<string, string> {
  const errors: Record<string, string> = { ...validateProductOptions(state.options) };

  if (state.slug.trim().length < 2) errors.slug = "Slug must be at least 2 characters";
  if (state.categoryId.length === 0) errors.categoryId = "Category is required";
  const cents = reaisToCents(state.basePriceReais);
  if (Number.isNaN(cents)) errors.basePriceReais = "Enter a valid price in BRL";
  if (state.thumbnailUrl.trim().length === 0) errors.thumbnailUrl = "Thumbnail URL is required";

  for (const locale of ["en", "pt-BR"] as const) {
    const t = state.translations[locale];
    if (t.name.trim().length === 0) errors[`translations.${locale}.name`] = "Name is required";
    if (t.shortDescription.trim().length === 0) {
      errors[`translations.${locale}.shortDescription`] = "Short description is required";
    }
    if (t.description.trim().length === 0) {
      errors[`translations.${locale}.description`] = "Description is required";
    }
  }

  return errors;
}

export function productFormToPayload(state: ProductFormState): CreateProductPayload {
  const cents = reaisToCents(state.basePriceReais);
  const cleanedOptions = state.options.map((option) => ({
    ...option,
    choices:
      option.type === "select"
        ? (option.choices ?? []).map((c) => c.trim()).filter(Boolean)
        : undefined,
  }));

  return {
    slug: state.slug.trim(),
    categoryId: state.categoryId,
    basePrice: cents,
    material: state.material,
    printTimeHours: printTimeHoursToStoredHours(parsePrintTimeHoursInput(state.printTimeHours)),
    weightGrams: Number(state.weightGrams) || 0,
    status: state.status,
    options: cleanedOptions,
    modelFileUrl: state.modelFileUrl.trim().length > 0 ? state.modelFileUrl.trim() : null,
    modelParts: state.modelParts,
    thumbnailUrl: state.thumbnailUrl.trim(),
    imageUrls: state.imageUrls.map((url) => url.trim()).filter(Boolean),
    tags: state.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    translations: state.translations,
  };
}

export function applySlugFromPtBrName(state: ProductFormState): ProductFormState {
  if (state.slugManual) return state;
  return { ...state, slug: slugify(state.translations["pt-BR"].name) };
}

/** Form weight field, or sum of detected model part weights when empty. */
export function resolveWeightGrams(state: ProductFormState): number {
  const fromField = Number(state.weightGrams) || 0;
  if (fromField > 0) {
    return fromField;
  }
  return Math.round(
    state.modelParts.reduce((sum, part) => sum + (part.weightGrams ?? 0), 0),
  );
}
