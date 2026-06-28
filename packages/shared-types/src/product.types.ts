export type MaterialType = "PLA" | "PETG" | "ABS" | "TPU" | "RESIN";

export type PrintStatus = "active" | "out_of_stock" | "discontinued";

export type ProductOptionType = "select" | "text" | "boolean";

export type ProductOption = {
  id: string;
  name: string;
  type: ProductOptionType;
  required: boolean;
  choices?: string[];
  defaultValue?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  basePrice: number;
  material: MaterialType;
  printTimeHours: number;
  weightGrams: number;
  status: PrintStatus;
  options: ProductOption[];
  modelFileUrl: string | null;
  thumbnailUrl: string;
  imageUrls: string[];
  tags: string[];
};
