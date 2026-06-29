import { adminObjectSchema, adminTag } from "./adminCommon.js";
import { adminProductDetailRouteSchema } from "./adminCatalogRouteSchemas.js";
import {
  internalErrorResponse,
  problemContent,
  unauthorizedResponse,
  validationErrorResponse,
} from "./responses.js";

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

export const adminSettingsGetRouteSchema = {
  tags: adminTag,
  summary: "Get shop settings",
  response: {
    200: {
      description: "Shop configuration",
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

export const adminSettingsUpdateRouteSchema = {
  tags: adminTag,
  summary: "Update shop settings",
  response: {
    200: adminSettingsGetRouteSchema.response[200],
    401: unauthorizedResponse,
    422: validationErrorResponse,
    500: internalErrorResponse,
  },
} as const;
