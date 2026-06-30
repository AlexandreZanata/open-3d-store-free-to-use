/** OpenAPI 3.1 component schemas — mirrors docs/api/contract.md and shared-types. */

export const problemDetailsSchema = {
  type: "object",
  required: ["type", "title", "status", "detail"],
  properties: {
    type: {
      type: "string",
      format: "uri",
      example: "https://yourdomain.com/errors/not-found",
    },
    title: { type: "string", example: "Product not found" },
    status: { type: "integer", example: 404 },
    detail: {
      type: "string",
      example: "No product with slug 'non-existent' exists",
    },
  },
} as const;

export const localeSchema = {
  type: "string",
  enum: ["en", "pt-BR"],
  example: "pt-BR",
} as const;

export const materialSchema = {
  type: "string",
  enum: ["PLA", "PETG", "PETG_HF", "ABS", "ASA", "TPU", "NYLON", "RESIN"],
} as const;

export const printStatusSchema = {
  type: "string",
  enum: ["active", "out_of_stock", "discontinued"],
} as const;

export const productOptionSchema = {
  type: "object",
  required: ["id", "name", "type", "required"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    type: { type: "string", enum: ["select", "text", "boolean"] },
    required: { type: "boolean" },
    choices: { type: "array", items: { type: "string" } },
    defaultValue: { type: "string" },
  },
} as const;

export const modelPartSchema = {
  type: "object",
  required: ["id", "name"],
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    volumeCm3: { type: "number", nullable: true },
    weightGrams: { type: "number", nullable: true },
    defaultColorHex: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
  },
} as const;

export const productListItemSchema = {
  type: "object",
  required: [
    "id",
    "slug",
    "name",
    "shortDescription",
    "categoryId",
    "basePrice",
    "basePriceDisplay",
    "material",
    "status",
    "thumbnailUrl",
    "hasModel",
    "tags",
    "locale",
  ],
  properties: {
    id: { type: "string", format: "uuid" },
    slug: { type: "string" },
    name: { type: "string" },
    shortDescription: { type: "string" },
    categoryId: { type: "string", format: "uuid" },
    basePrice: { type: "integer", description: "Price in BRL cents" },
    basePriceDisplay: { type: "string", example: "R$ 45,00" },
    material: materialSchema,
    status: printStatusSchema,
    thumbnailUrl: { type: "string" },
    hasModel: { type: "boolean" },
    tags: { type: "array", items: { type: "string" } },
    locale: localeSchema,
  },
} as const;

export const productDetailSchema = {
  allOf: [
    productListItemSchema,
    {
      type: "object",
      required: [
        "description",
        "printTimeHours",
        "weightGrams",
        "options",
        "modelFileUrl",
        "modelParts",
        "imageUrls",
      ],
      properties: {
        description: { type: "string" },
        printTimeHours: { type: "number" },
        weightGrams: { type: "number" },
        options: { type: "array", items: productOptionSchema },
        modelFileUrl: { type: "string", nullable: true },
        modelParts: { type: "array", items: modelPartSchema },
        imageUrls: { type: "array", items: { type: "string" } },
      },
    },
  ],
} as const;

export const categorySchema = {
  type: "object",
  required: ["id", "slug", "name", "sortOrder"],
  properties: {
    id: { type: "string", format: "uuid" },
    slug: { type: "string" },
    name: { type: "string" },
    description: { type: "string", nullable: true },
    parentId: { type: "string", format: "uuid", nullable: true },
    imageUrl: { type: "string", nullable: true },
    sortOrder: { type: "integer" },
    locale: localeSchema,
  },
} as const;

export const paginationSchema = {
  type: "object",
  required: ["total", "page", "totalPages", "limit"],
  properties: {
    total: { type: "integer" },
    page: { type: "integer", minimum: 1 },
    totalPages: { type: "integer" },
    limit: { type: "integer", minimum: 1, maximum: 50 },
  },
} as const;

export const captureOrderItemSchema = {
  type: "object",
  required: ["productId", "quantity", "selectedOptions"],
  properties: {
    productId: { type: "string", format: "uuid" },
    quantity: { type: "integer", minimum: 1 },
    selectedOptions: {
      type: "object",
      additionalProperties: { type: "string" },
      example: { Color: "White", "Name to engrave": "John" },
    },
  },
} as const;

export const captureOrderBodySchema = {
  type: "object",
  required: ["items"],
  properties: {
    items: {
      type: "array",
      minItems: 1,
      items: captureOrderItemSchema,
    },
    customerName: { type: "string" },
    customerNote: { type: "string" },
  },
} as const;

export const captureOrderResultSchema = {
  type: "object",
  required: ["orderId", "whatsappLink", "totalPrice", "summary"],
  properties: {
    orderId: { type: "string", format: "uuid" },
    whatsappLink: { type: "string", format: "uri" },
    totalPrice: { type: "string", example: "R$ 90,00" },
    summary: { type: "string", example: "2x Custom Photo Frame (White, John)" },
  },
} as const;

export const healthResponseSchema = {
  type: "object",
  required: ["status", "uptime", "timestamp"],
  properties: {
    status: { type: "string", enum: ["ok"] },
    uptime: { type: "integer", description: "Process uptime in seconds" },
    timestamp: { type: "string", format: "date-time" },
  },
} as const;
