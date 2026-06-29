import { productListItemSchema } from "./components.js";
import {
  deviceIdHeader,
  favoritesTag,
  storeAccountTag,
  storeAuthTag,
  storeCartItemSchema,
  storeUserSchema,
  visitorIdHeader,
} from "./storeCommon.js";
import {
  internalErrorResponse,
  problemContent,
  rateLimitResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "./responses.js";

const storeUserResponse = {
  description: "Authenticated store user profile",
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["data"],
        properties: { data: storeUserSchema },
      },
    },
  },
} as const;

const registrationLimitResponse = {
  description: "Registration limit reached for IP or device",
  content: problemContent({
    type: "https://yourdomain.com/errors/registration-limit",
    title: "Registration limit",
    status: 403,
    detail: "Maximum number of accounts reached",
  }),
};

const registerBodySchema = {
  type: "object",
  required: ["email", "password", "displayName"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 8 },
    displayName: { type: "string", minLength: 1, maxLength: 80 },
    cart: { type: "array", items: storeCartItemSchema },
    checkoutNote: { type: "string", maxLength: 500, nullable: true },
  },
} as const;

const loginBodySchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 1 },
    cart: { type: "array", items: storeCartItemSchema },
    checkoutNote: { type: "string", maxLength: 500, nullable: true },
  },
} as const;

export const storeRegisterRouteSchema = {
  tags: storeAuthTag,
  summary: "Register storefront shopper account",
  description:
    "Creates account, merges optional local cart, sets session cookie `print3d_store_session`.",
  parameters: [deviceIdHeader, visitorIdHeader],
  body: registerBodySchema,
  response: {
    201: storeUserResponse,
    400: validationErrorResponse,
    403: registrationLimitResponse,
    422: validationErrorResponse,
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;

export const storeLoginRouteSchema = {
  tags: storeAuthTag,
  summary: "Login storefront shopper",
  description: "Authenticates shopper and sets session cookie.",
  parameters: [visitorIdHeader],
  body: loginBodySchema,
  response: {
    200: storeUserResponse,
    401: unauthorizedResponse,
    422: validationErrorResponse,
    429: rateLimitResponse,
    500: internalErrorResponse,
  },
} as const;

export const storeLogoutRouteSchema = {
  tags: storeAuthTag,
  summary: "Logout storefront shopper",
  description: "Revokes session and clears cookie. Requires session.",
  response: {
    204: { description: "Session cleared" },
    401: unauthorizedResponse,
    500: internalErrorResponse,
  },
} as const;

export const storeMeGetRouteSchema = {
  tags: storeAccountTag,
  summary: "Current shopper profile",
  response: {
    200: storeUserResponse,
    401: unauthorizedResponse,
    500: internalErrorResponse,
  },
} as const;

export const storeMePatchRouteSchema = {
  tags: storeAccountTag,
  summary: "Update shopper profile",
  body: {
    type: "object",
    minProperties: 1,
    properties: {
      displayName: { type: "string", minLength: 1, maxLength: 80 },
      checkoutNote: { type: "string", maxLength: 500, nullable: true },
    },
  },
  response: {
    200: storeUserResponse,
    401: unauthorizedResponse,
    422: validationErrorResponse,
    500: internalErrorResponse,
  },
} as const;

export const storeMeCartPutRouteSchema = {
  tags: storeAccountTag,
  summary: "Replace persisted cart",
  body: {
    type: "object",
    required: ["cart"],
    properties: {
      cart: { type: "array", items: storeCartItemSchema },
    },
  },
  response: {
    200: {
      description: "Saved cart",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["data"],
            properties: {
              data: {
                type: "object",
                required: ["cart"],
                properties: { cart: { type: "array", items: storeCartItemSchema } },
              },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    422: validationErrorResponse,
    500: internalErrorResponse,
  },
} as const;

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
