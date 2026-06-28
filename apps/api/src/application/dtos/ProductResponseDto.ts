import type { Category, Product } from "@print3d/shared-types";

import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import { Price } from "../../domain/value-objects/Price.js";

export type ProductListItemDto = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  categoryId: string;
  basePrice: number;
  basePriceDisplay: string;
  material: Product["material"];
  status: Product["status"];
  thumbnailUrl: string;
  hasModel: boolean;
  tags: string[];
  locale: SupportedLocale;
};

export type ProductDetailDto = ProductListItemDto & {
  description: string;
  printTimeHours: number;
  weightGrams: number;
  options: Product["options"];
  modelFileUrl: string | null;
  imageUrls: string[];
};

export type CategoryDto = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  locale: SupportedLocale;
};

export function toProductListItemDto(
  product: Product,
  locale: SupportedLocale,
): ProductListItemDto {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    categoryId: product.categoryId,
    basePrice: product.basePrice,
    basePriceDisplay: Price.fromCents(product.basePrice).toDisplay(),
    material: product.material,
    status: product.status,
    thumbnailUrl: product.thumbnailUrl,
    hasModel: product.modelFileUrl !== null,
    tags: product.tags,
    locale,
  };
}

export function toProductDetailDto(
  product: Product,
  locale: SupportedLocale,
): ProductDetailDto {
  return {
    ...toProductListItemDto(product, locale),
    description: product.description,
    printTimeHours: product.printTimeHours,
    weightGrams: product.weightGrams,
    options: product.options,
    modelFileUrl: product.modelFileUrl,
    imageUrls: product.imageUrls,
  };
}

export function toCategoryDto(
  category: Category,
  locale: SupportedLocale,
): CategoryDto {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    parentId: category.parentId,
    imageUrl: category.imageUrl,
    sortOrder: category.sortOrder,
    locale,
  };
}
