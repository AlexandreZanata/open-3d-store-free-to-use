import { paginationSchema } from "./components.js";
import {
  internalErrorResponse,
  problemContent,
  rateLimitResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "./responses.js";

const adminTag = ["Admin"] as const;

const adminObjectSchema = {
  type: "object",
  additionalProperties: true,
} as const;

const adminUserSchema = {
  type: "object",
  required: ["id", "email", "role", "lastLoginAt"],
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string", format: "email" },
    role: { type: "string", enum: ["admin"] },
    lastLoginAt: { type: "string", format: "date-time", nullable: true },
  },
} as const;

export const adminLoginRouteSchema = {
  tags: adminTag,
  summary: "Admin login",
  response: {
    200: {
      description: "Authenticated admin profile",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: adminUserSchema },
          },
        },
      },
    },
    401: unauthorizedResponse,
    422: validationErrorResponse,
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;

export const adminLogoutRouteSchema = {
  tags: adminTag,
  summary: "Admin logout",
  response: {
    204: { description: "Session cleared" },
    401: unauthorizedResponse,
    500: internalErrorResponse,
  },
} as const;

export const adminMeRouteSchema = {
  tags: adminTag,
  summary: "Current admin profile",
  response: {
    200: {
      description: "Authenticated admin",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: adminUserSchema },
          },
        },
      },
    },
    401: unauthorizedResponse,
    500: internalErrorResponse,
  },
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
    404: {
      description: "Product not found",
      content: problemContent({
        type: "https://yourdomain.com/errors/not-found",
        title: "Not found",
        status: 404,
        detail: "Resource not found",
      }),
    },
    500: internalErrorResponse,
  },
} as const;

export const adminProductCreateRouteSchema = {
  tags: adminTag,
  summary: "Create product",
  response: {
    201: adminProductDetailRouteSchema.response[200],
    401: unauthorizedResponse,
    409: {
      description: "Slug conflict",
      content: problemContent({
        type: "https://yourdomain.com/errors/conflict",
        title: "Conflict",
        status: 409,
        detail: "Slug already exists",
      }),
    },
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
    404: adminProductDetailRouteSchema.response[404],
    409: adminProductCreateRouteSchema.response[409],
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
    404: adminProductDetailRouteSchema.response[404],
    409: adminProductCreateRouteSchema.response[409],
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
    404: adminProductDetailRouteSchema.response[404],
    500: internalErrorResponse,
  },
} as const;

export const adminCategoryCreateRouteSchema = {
  tags: adminTag,
  summary: "Create category",
  response: {
    201: adminCategoryDetailRouteSchema.response[200],
    401: unauthorizedResponse,
    409: adminProductCreateRouteSchema.response[409],
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
    404: adminProductDetailRouteSchema.response[404],
    409: adminProductCreateRouteSchema.response[409],
    500: internalErrorResponse,
  },
} as const;

export const adminOrderListRouteSchema = {
  tags: adminTag,
  summary: "List captured orders",
  response: {
    200: {
      description: "Paginated orders",
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
    500: internalErrorResponse,
  },
} as const;

export const adminOrderDetailRouteSchema = {
  tags: adminTag,
  summary: "Get order capture detail",
  response: {
    200: {
      description: "Order detail",
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
    404: adminProductDetailRouteSchema.response[404],
    500: internalErrorResponse,
  },
} as const;

export const adminUploadRouteSchema = {
  tags: adminTag,
  summary: "Upload catalog asset",
  consumes: ["multipart/form-data"],
  response: {
    201: {
      description: "Uploaded file metadata",
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
    400: {
      description: "Missing multipart file",
      content: problemContent({
        type: "https://yourdomain.com/errors/bad-request",
        title: "Bad request",
        status: 400,
        detail: "Missing file upload",
      }),
    },
    401: unauthorizedResponse,
    422: validationErrorResponse,
    500: internalErrorResponse,
  },
} as const;
