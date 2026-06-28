import type { AdminDataResponse, BilingualTranslations } from "./admin.types.js";

export type CategoryTranslationFields = {
  name: string;
  description: string | null;
};

export type AdminCategoryTranslations = BilingualTranslations<CategoryTranslationFields>;

export type AdminCategoryWriteBase = {
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  translations: AdminCategoryTranslations;
};

export type CreateCategoryPayload = AdminCategoryWriteBase;

export type UpdateCategoryPayload = Partial<AdminCategoryWriteBase>;

export type AdminCategoryListItem = AdminCategoryWriteBase & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCategoryDetail = AdminCategoryListItem;

export type AdminCategoryListResponse = AdminDataResponse<AdminCategoryListItem[]>;

export type AdminCategoryDetailResponse = AdminDataResponse<AdminCategoryDetail>;

export type CreateCategoryResponse = AdminCategoryDetailResponse;

export type UpdateCategoryResponse = AdminCategoryDetailResponse;
