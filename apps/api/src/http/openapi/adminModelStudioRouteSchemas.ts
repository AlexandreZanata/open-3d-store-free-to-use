import { adminObjectSchema, adminTag } from "./adminCommon.js";
import { adminProductDetailRouteSchema } from "./adminCatalogRouteSchemas.js";
import {
  internalErrorResponse,
  unauthorizedResponse,
} from "./responses.js";

export const adminModelJobDetailRouteSchema = {
  tags: adminTag,
  summary: "Get async model processing job status",
  response: {
    200: {
      description: "Model processing job",
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

export const adminBulkPrepriceRouteSchema = {
  tags: adminTag,
  summary: "Recalculate product base prices from model parts",
  response: {
    200: {
      description: "Bulk preprice summary",
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
