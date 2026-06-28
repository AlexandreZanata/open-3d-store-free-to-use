import type { CatalogTranslations } from "../src/infrastructure/repositories/mappers/resolveTranslation.js";

export type SeedCategory = {
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  imageUrl: string | null;
  translations: CatalogTranslations;
};

export type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  categorySlug: string;
  basePrice: number;
  material: "PLA" | "PETG" | "ABS" | "TPU" | "RESIN";
  printTimeHours: number;
  weightGrams: number;
  status: "active" | "out_of_stock" | "discontinued";
  modelFileUrl: string | null;
  thumbnailUrl: string;
  imageUrls: string[];
  tags: string[];
  translations: CatalogTranslations;
};
