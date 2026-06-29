import { paginationSchema } from "./components.js";
import { adminObjectSchema, adminTag } from "./adminCommon.js";
import {
  internalErrorResponse,
  problemContent,
  rateLimitResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "./responses.js";

const notFoundResponse = {
  description: "Resource not found",
  content: problemContent({
    type: "https://yourdomain.com/errors/not-found",
    title: "Not found",
    status: 404,
    detail: "Resource not found",
  }),
} as const;

const slugConflictResponse = {
  description: "Slug conflict",
  content: problemContent({
    type: "https://yourdomain.com/errors/conflict",
    title: "Conflict",
    status: 409,
    detail: "Slug already exists",
  }),
} as const;

export const adminProductListRouteSchema = {
  tags: adminTag,
  summary: "List products (all statuses)",
  response: {
    200: {
      description: "Paginated admin products",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data", "pagination"],
            properties: {
              data: { type: "array", items: adminObjectSchema },
              pagination: paginationSchema,
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;

export const adminProductDetailRouteSchema = {
  tags: adminTag,
  summary: "Get product by id",
  response: {
    200: {
      description: "Admin product detail",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: adminObjectSchema },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundResponse,
    500: internalErrorResponse,
  },
} as const;

export const adminProductCreateRouteSchema = {
  tags: adminTag,
  summary: "Create product",
  response: {
    201: adminProductDetailRouteSchema.response[200],
    401: unauthorizedResponse,
    409: slugConflictResponse,
    422: validationErrorResponse,
    500: internalErrorResponse,
  },
} as const;

export const adminProductUpdateRouteSchema = {
  tags: adminTag,
  summary: "Update product",
  response: {
    200: adminProductDetailRouteSchema.response[200],
    401: unauthorizedResponse,
    404: notFoundResponse,
    409: slugConflictResponse,
    422: validationErrorResponse,
    500: internalErrorResponse,
  },
} as const;

export const adminProductDeleteRouteSchema = {
  tags: adminTag,
  summary: "Delete product",
  response: {
    204: { description: "Product deleted" },
    401: unauthorizedResponse,
    404: notFoundResponse,
    409: slugConflictResponse,
    500: internalErrorResponse,
  },
} as const;

export const adminCategoryListRouteSchema = {
  tags: adminTag,
  summary: "List categories",
  response: {
    200: {
      description: "All categories including inactive",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: { type: "array", items: adminObjectSchema } },
          },
        },
      },
    },
    401: unauthorizedResponse,
    500: internalErrorResponse,
  },
} as const;

export const adminCategoryDetailRouteSchema = {
  tags: adminTag,
  summary: "Get category by id",
  response: {
    200: {
      description: "Category detail",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: adminObjectSchema },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundResponse,
    500: internalErrorResponse,
  },
} as const;

export const adminCategoryCreateRouteSchema = {
  tags: adminTag,
  summary: "Create category",
  response: {
    201: adminCategoryDetailRouteSchema.response[200],
    401: unauthorizedResponse,
    409: slugConflictResponse,
    422: validationErrorResponse,
    500: internalErrorResponse,
  },
} as const;

export const adminCategoryUpdateRouteSchema = adminCategoryCreateRouteSchema;

export const adminCategoryDeleteRouteSchema = {
  tags: adminTag,
  summary: "Soft-delete category",
  response: {
    204: { description: "Category deactivated" },
    401: unauthorizedResponse,
    404: notFoundResponse,
    409: slugConflictResponse,
    500: internalErrorResponse,
  },
} as const;
