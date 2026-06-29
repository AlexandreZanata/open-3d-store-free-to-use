export const storeAuthTag = ["Store Auth"] as const;
export const storeAccountTag = ["Store Account"] as const;
export const favoritesTag = ["Favorites"] as const;

export const storeCartItemSchema = {
  type: "object",
  required: [
    "productId",
    "slug",
    "name",
    "thumbnailUrl",
    "basePriceDisplay",
    "quantity",
    "selectedOptions",
  ],
  properties: {
    productId: { type: "string", format: "uuid" },
    slug: { type: "string" },
    name: { type: "string" },
    thumbnailUrl: { type: "string" },
    basePriceDisplay: { type: "string", example: "R$ 45,00" },
    quantity: { type: "integer", minimum: 1 },
    selectedOptions: { type: "object", additionalProperties: { type: "string" } },
  },
} as const;

export const storeUserSchema = {
  type: "object",
  required: ["id", "email", "displayName"],
  properties: {
    id: { type: "string" },
    email: { type: "string", format: "email" },
    displayName: { type: "string" },
    cart: { type: "array", items: storeCartItemSchema },
    checkoutNote: { type: "string", nullable: true },
  },
} as const;

export const deviceIdHeader = {
  name: "X-Device-Id",
  in: "header" as const,
  required: true,
  schema: { type: "string", format: "uuid" },
  description: "Device UUID v4 — required for register (max 2 accounts per device).",
};

export const visitorIdHeader = {
  name: "X-Visitor-Id",
  in: "header" as const,
  required: false,
  schema: { type: "string", format: "uuid" },
  description: "Anonymous visitor UUID — required for favorites when no session cookie.",
};
