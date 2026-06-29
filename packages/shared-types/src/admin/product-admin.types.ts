import type {
  AdminDataResponse,
  AdminPaginatedResponse,
  BilingualTranslations,
} from "./admin.types.js";
import type { MaterialType, PrintStatus, ProductOption } from "../product.types.js";
import type { ModelPart } from "./model-studio.types.js";

export type ProductTranslationFields = {
  name: string;
  description: string;
  shortDescription: string;
};

export type AdminProductTranslations = BilingualTranslations<ProductTranslationFields>;

export type AdminProductWriteBase = {
  slug: string;
  categoryId: string;
  basePrice: number;
  material: MaterialType;
  printTimeHours: number;
  weightGrams: number;
  status: PrintStatus;
  options: ProductOption[];
  modelFileUrl: string | null;
  modelParts: ModelPart[];
  thumbnailUrl: string;
  imageUrls: string[];
  tags: string[];
  translations: AdminProductTranslations;
};

export type CreateProductPayload = AdminProductWriteBase;

export type UpdateProductPayload = Partial<AdminProductWriteBase>;

export type AdminProductListItem = AdminProductWriteBase & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductDetail = AdminProductListItem;

export type AdminProductListResponse = AdminPaginatedResponse<AdminProductListItem>;

export type AdminProductDetailResponse = AdminDataResponse<AdminProductDetail>;

export type CreateProductResponse = AdminProductDetailResponse;

export type UpdateProductResponse = AdminProductDetailResponse;
