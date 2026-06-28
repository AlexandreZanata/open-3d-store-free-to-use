export type {
  CaptureOrderInput,
  CaptureOrderItemInput,
  CaptureOrderResult,
  CategoryResponse,
  PaginatedProducts,
  PaginationMeta,
  ProblemDetails,
  ProductDetail,
  ProductListItem,
  SupportedLocale,
} from "@print3d/shared-types";

export type ProductQueryParams = {
  page?: number;
  limit?: number;
  category?: string;
  material?: string;
  status?: "active" | "out_of_stock";
  q?: string;
  minPrice?: number;
  maxPrice?: number;
};
