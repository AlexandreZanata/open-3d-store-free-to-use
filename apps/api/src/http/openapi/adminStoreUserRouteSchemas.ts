import { paginationSchema } from "./components.js";
import { adminObjectSchema, adminTag } from "./adminCommon.js";
import { adminProductDetailRouteSchema } from "./adminCatalogRouteSchemas.js";
import { internalErrorResponse, unauthorizedResponse, validationErrorResponse } from "./responses.js";

export const adminStoreUserListRouteSchema = {
  tags: adminTag,
  summary: "List storefront shopper accounts",
  response: {
    200: {
      description: "Paginated store users",
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

export const adminStoreUserDetailRouteSchema = {
  tags: adminTag,
  summary: "Get storefront shopper account",
  response: {
    200: {
      description: "Store user detail",
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

export const adminStoreUserUpdateRouteSchema = {
  tags: adminTag,
  summary: "Activate or deactivate storefront shopper account",
  response: {
    200: adminStoreUserDetailRouteSchema.response[200],
    401: unauthorizedResponse,
    404: adminProductDetailRouteSchema.response[404],
    422: validationErrorResponse,
    500: internalErrorResponse,
  },
} as const;
