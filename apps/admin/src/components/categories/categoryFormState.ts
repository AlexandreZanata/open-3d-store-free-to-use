import type {
  AdminCategoryDetail,
  CreateCategoryPayload,
} from "@print3d/shared-types";

import { slugify } from "@/lib/slugify";

export type CategoryFormState = {
  slug: string;
  slugManual: boolean;
  parentId: string;
  imageUrl: string;
  sortOrder: string;
  isActive: boolean;
  translations: CreateCategoryPayload["translations"];
};

export function createEmptyCategoryForm(): CategoryFormState {
  return {
    slug: "",
    slugManual: false,
    parentId: "",
    imageUrl: "",
    sortOrder: "0",
    isActive: true,
    translations: {
      en: { name: "", description: "" },
      "pt-BR": { name: "", description: "" },
    },
  };
}

export function categoryToFormState(category: AdminCategoryDetail): CategoryFormState {
  return {
    slug: category.slug,
    slugManual: true,
    parentId: category.parentId ?? "",
    imageUrl: category.imageUrl ?? "",
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
    translations: category.translations,
  };
}

export function validateCategoryForm(state: CategoryFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (state.slug.trim().length < 2) errors.slug = "Slug must be at least 2 characters";
  for (const locale of ["en", "pt-BR"] as const) {
    if (state.translations[locale].name.trim().length === 0) {
      errors[`translations.${locale}.name`] = "Name is required";
    }
  }
  return errors;
}

export function categoryFormToPayload(state: CategoryFormState): CreateCategoryPayload {
  return {
    slug: state.slug.trim(),
    parentId: state.parentId.trim().length > 0 ? state.parentId.trim() : null,
    imageUrl: state.imageUrl.trim().length > 0 ? state.imageUrl.trim() : null,
    sortOrder: Number(state.sortOrder) || 0,
    isActive: state.isActive,
    translations: {
      en: {
        name: state.translations.en.name.trim(),
        description: state.translations.en.description?.trim() || null,
      },
      "pt-BR": {
        name: state.translations["pt-BR"].name.trim(),
        description: state.translations["pt-BR"].description?.trim() || null,
      },
    },
  };
}

export function applySlugFromPtBrName(state: CategoryFormState): CategoryFormState {
  if (state.slugManual) return state;
  return { ...state, slug: slugify(state.translations["pt-BR"].name) };
}
