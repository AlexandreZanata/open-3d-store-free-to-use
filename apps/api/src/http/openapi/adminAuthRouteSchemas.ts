import { adminTag, adminUserSchema } from "./adminCommon.js";
import {
  internalErrorResponse,
  rateLimitResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "./responses.js";

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

export const adminRefreshRouteSchema = {
  tags: adminTag,
  summary: "Refresh admin session (sliding idle TTL)",
  response: {
    200: {
      description: "Session extended; same shape as /auth/me",
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
