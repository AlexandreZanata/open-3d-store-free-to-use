import {
  SUPPORTED_LOCALES,
  type AdminCategoryTranslations,
  type AdminProductTranslations,
  type CreateCategoryPayload,
  type CreateProductPayload,
  type ModelPart,
  type UpdateCategoryPayload,
  type UpdateProductPayload,
} from "@print3d/shared-types";

import { ValidationError } from "../errors/ApplicationErrors.js";
import { Price } from "../../domain/value-objects/Price.js";
import { Slug } from "../../domain/value-objects/Slug.js";

export function parseProductSlug(raw: string): string {
  return Slug.from(raw).toString();
}

export function parseProductPrice(cents: number): number {
  return Price.fromCents(cents).toCents();
}

export function validateProductTranslations(
  translations: AdminProductTranslations,
): void {
  for (const locale of SUPPORTED_LOCALES) {
    const branch = translations[locale];
    if (
      branch.name.trim() === "" ||
      branch.description.trim() === "" ||
      branch.shortDescription.trim() === ""
    ) {
      throw new ValidationError(
        `Product translations.${locale} requires name, description, and shortDescription`,
      );
    }
  }
}

export function validateCategoryTranslations(
  translations: AdminCategoryTranslations,
): void {
  for (const locale of SUPPORTED_LOCALES) {
    const branch = translations[locale];
    if (branch.name.trim() === "") {
      throw new ValidationError(
        `Category translations.${locale} requires name`,
      );
    }
  }
}

export function normalizeCreateProductInput(
  input: CreateProductPayload,
): CreateProductPayload {
  validateProductTranslations(input.translations);
  return {
    ...input,
    slug: parseProductSlug(input.slug),
    basePrice: parseProductPrice(input.basePrice),
    modelParts: normalizeModelParts(input.modelParts ?? []),
  };
}

export function normalizeUpdateProductInput(
  input: UpdateProductPayload,
): UpdateProductPayload {
  const normalized: UpdateProductPayload = { ...input };
  if (input.slug !== undefined) {
    normalized.slug = parseProductSlug(input.slug);
  }
  if (input.basePrice !== undefined) {
    normalized.basePrice = parseProductPrice(input.basePrice);
  }
  if (input.modelParts !== undefined) {
    normalized.modelParts = normalizeModelParts(input.modelParts);
  }
  if (input.translations !== undefined) {
    validateProductTranslations(input.translations);
  }
  return normalized;
}

function normalizeModelParts(parts: ModelPart[]): ModelPart[] {
  return parts.map((part) => ({
    ...part,
    weightGrams:
      part.weightGrams === null ? null : Math.round(part.weightGrams),
  }));
}

export function normalizeCreateCategoryInput(
  input: CreateCategoryPayload,
): CreateCategoryPayload {
  validateCategoryTranslations(input.translations);
  return {
    ...input,
    slug: parseProductSlug(input.slug),
  };
}

export function normalizeUpdateCategoryInput(
  input: UpdateCategoryPayload,
): UpdateCategoryPayload {
  const normalized: UpdateCategoryPayload = { ...input };
  if (input.slug !== undefined) {
    normalized.slug = parseProductSlug(input.slug);
  }
  if (input.translations !== undefined) {
    validateCategoryTranslations(input.translations);
  }
  return normalized;
}
