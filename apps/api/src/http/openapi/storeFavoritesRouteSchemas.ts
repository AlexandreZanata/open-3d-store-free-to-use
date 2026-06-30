import { productListItemSchema } from "./components.js";
import { favoritesTag, visitorIdHeader } from "./storeCommon.js";
import {
  internalErrorResponse,
  problemContent,
  rateLimitResponse,
  validationErrorResponse,
} from "./responses.js";

export const favoritesListRouteSchema = {
  tags: favoritesTag,
  summary: "List favorited products",
  parameters: [visitorIdHeader],
  response: {
    200: {
      description: "Favorited active products",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data", "meta"],
            properties: {
              data: { type: "array", items: productListItemSchema },
              meta: {
                type: "object",
                required: ["count", "productIds"],
                properties: {
                  count: { type: "integer" },
                  productIds: { type: "array", items: { type: "string", format: "uuid" } },
                },
              },
            },
          },
        },
      },
    },
    400: validationErrorResponse,
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;

const favoriteMutationResponse = {
  description: "Favorite state updated",
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["data"],
        properties: {
          data: {
            type: "object",
            required: ["productId", "favorited"],
            properties: {
              productId: { type: "string", format: "uuid" },
              favorited: { type: "boolean" },
            },
          },
        },
      },
    },
  },
} as const;

export const favoritesAddRouteSchema = {
  tags: favoritesTag,
  summary: "Add product to favorites",
  parameters: [visitorIdHeader],
  params: {
    type: "object",
    required: ["productId"],
    properties: { productId: { type: "string", format: "uuid" } },
  },
  response: {
    201: favoriteMutationResponse,
    400: validationErrorResponse,
    404: {
      description: "Product not found or inactive",
      content: problemContent({
        type: "https://yourdomain.com/errors/not-found",
        title: "Product not found",
        status: 404,
        detail: "Product not found",
      }),
    },
    422: validationErrorResponse,
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;

export const favoritesRemoveRouteSchema = {
  tags: favoritesTag,
  summary: "Remove product from favorites",
  parameters: [visitorIdHeader],
  params: {
    type: "object",
    required: ["productId"],
    properties: { productId: { type: "string", format: "uuid" } },
  },
  response: {
    200: favoriteMutationResponse,
    400: validationErrorResponse,
    422: validationErrorResponse,
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;
