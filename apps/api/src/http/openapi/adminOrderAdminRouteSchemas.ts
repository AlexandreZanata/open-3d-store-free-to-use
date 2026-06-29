import { paginationSchema } from "./components.js";
import { adminObjectSchema, adminTag } from "./adminCommon.js";
import { adminProductDetailRouteSchema } from "./adminCatalogRouteSchemas.js";
import { internalErrorResponse, unauthorizedResponse } from "./responses.js";

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
