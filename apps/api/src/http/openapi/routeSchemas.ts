import {
  captureOrderBodySchema,
  captureOrderResultSchema,
  categorySchema,
  healthResponseSchema,
  materialSchema,
  paginationSchema,
  printStatusSchema,
  problemDetailsSchema,
  productDetailSchema,
  productListItemSchema,
} from "./components.js";
import {
  internalErrorResponse,
  problemContent,
  rateLimitResponse,
  validationErrorResponse,
} from "./responses.js";

const localeQueryProperty = {
  type: "string",
  enum: ["en", "pt-BR"],
  description: "Locale override (default: pt-BR). Also honors Accept-Language header.",
} as const;

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

export const captureOrderRouteSchema = {
  tags: ["Orders"],
  summary: "Capture order intent and get WhatsApp link",
  description:
    "Anonymous order capture. Validates products, options, and stock. " +
    "Rate limit: 10 requests/IP/minute. " +
    "422 variants: invalid body, product not orderable (`not-orderable`), missing required option.",
  querystring: {
    type: "object",
    properties: { locale: localeQueryProperty },
  },
  body: captureOrderBodySchema,
  response: {
    201: {
      description: "Order captured — redirect user to whatsappLink",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: { data: captureOrderResultSchema },
          },
        },
      },
    },
    404: {
      description: "Product in cart not found",
      content: problemContent({
        type: "https://yourdomain.com/errors/not-found",
        title: "Product not found",
        status: 404,
        detail: "Product 01935... was not found",
      }),
    },
    422: {
      description:
        "Invalid body, product not orderable, or missing required product option (RFC 7807)",
      content: {
        "application/json": {
          schema: problemDetailsSchema,
          examples: {
            validationFailed: {
              summary: "Invalid request body",
              value: {
                type: "https://yourdomain.com/errors/validation-failed",
                title: "Validation failed",
                status: 422,
                detail: "One or more fields are invalid",
              },
            },
            notOrderable: {
              summary: "Product out of stock or discontinued",
              value: {
                type: "https://yourdomain.com/errors/not-orderable",
                title: "Product not orderable",
                status: 422,
                detail: "Product is out of stock or discontinued",
              },
            },
            missingOption: {
              summary: "Required product option missing",
              value: {
                type: "https://yourdomain.com/errors/validation-failed",
                title: "Validation failed",
                status: 422,
                detail: "Missing required option 'Color' for product 01935...",
              },
            },
          },
        },
      },
    },
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;
