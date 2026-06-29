import type { Product } from "./product.types.js";
import type { SupportedLocale } from "./locale.types.js";
import type { ModelPart } from "./admin/model-studio.types.js";

export type ProductListItem = {
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

export type ProductDetail = ProductListItem & {
  description: string;
  printTimeHours: number;
  weightGrams: number;
  options: Product["options"];
  modelFileUrl: string | null;
  modelParts: ModelPart[];
  imageUrls: string[];
};

export type CategoryResponse = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null;
  sortOrder: number;
  locale?: SupportedLocale;
};

export type PaginationMeta = {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

export type PaginatedProducts = {
  data: ProductListItem[];
  pagination: PaginationMeta;
};

export type CaptureOrderItemInput = {
  productId: string;
  quantity: number;
  selectedOptions: Record<string, string>;
};

export type CaptureOrderInput = {
  items: CaptureOrderItemInput[];
  customerName?: string;
  customerNote?: string;
};

export type CaptureOrderResult = {
  orderId: string;
  whatsappLink: string;
  totalPrice: string;
  summary: string;
};

export type FavoriteToggleResult = {
  productId: string;
  favorited: boolean;
};

export type FavoriteListResponse = {
  data: ProductListItem[];
  meta: { count: number; productIds: string[] };
};

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
};
