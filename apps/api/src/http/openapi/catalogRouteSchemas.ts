import {
  categorySchema,
  healthResponseSchema,
  materialSchema,
  paginationSchema,
  printStatusSchema,
  productDetailSchema,
  productListItemSchema,
} from "./components.js";
import { localeQueryProperty } from "./localeQuery.js";
import {
  internalErrorResponse,
  problemContent,
  rateLimitResponse,
  validationErrorResponse,
} from "./responses.js";

export const healthRouteSchema = {
  tags: ["Health"],
  summary: "Service health check",
  description: "Returns process uptime and timestamp. No caching. Used by monitors and CI.",
  response: {
    200: {
      description: "Service is healthy",
      content: { "application/json": { schema: healthResponseSchema } },
    },
    500: internalErrorResponse,
  },
} as const;

export const categoriesRouteSchema = {
  tags: ["Categories"],
  summary: "List active categories",
  description: "Returns categories sorted by `sortOrder`. Cache: `public, max-age=300`.",
  querystring: {
    type: "object",
    properties: { locale: localeQueryProperty },
  },
  response: {
    200: {
      description: "Category list",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: { type: "array", items: categorySchema } },
          },
        },
      },
    },
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;

export const productsListRouteSchema = {
  tags: ["Products"],
  summary: "List or search products",
  description:
    "Paginated catalog. Use `q` for full-text search (cache max-age 60s). Default list cache: 120s.",
  querystring: {
    type: "object",
    properties: {
      locale: localeQueryProperty,
      page: { type: "integer", minimum: 1, default: 1 },
      limit: { type: "integer", minimum: 1, maximum: 50, default: 20 },
      category: { type: "string", description: "Category slug filter" },
      material: materialSchema,
      status: { ...printStatusSchema, default: "active" },
      q: { type: "string", description: "Full-text search query" },
      minPrice: { type: "integer", description: "Minimum price (BRL cents)" },
      maxPrice: { type: "integer", description: "Maximum price (BRL cents)" },
    },
  },
  response: {
    200: {
      description: "Paginated product list",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data", "pagination"],
            properties: {
              data: { type: "array", items: productListItemSchema },
              pagination: paginationSchema,
            },
          },
        },
      },
    },
    422: validationErrorResponse,
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;

export const productDetailRouteSchema = {
  tags: ["Products"],
  summary: "Get product by slug",
  description: "Full product detail including options and 3D model URL. Cache: `public, max-age=600`.",
  params: {
    type: "object",
    required: ["slug"],
    properties: { slug: { type: "string", example: "custom-photo-frame" } },
  },
  querystring: {
    type: "object",
    properties: { locale: localeQueryProperty },
  },
  response: {
    200: {
      description: "Product detail",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: productDetailSchema },
          },
        },
      },
    },
    404: {
      description: "Product not found",
      content: problemContent({
        type: "https://yourdomain.com/errors/not-found",
        title: "Product not found",
        status: 404,
        detail: "No product with slug 'non-existent' exists",
      }),
    },
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;
