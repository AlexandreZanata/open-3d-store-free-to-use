import { MATERIAL_TYPES, PAYMENT_METHODS } from "@print3d/shared-types";
import { z } from "zod";

const materials = MATERIAL_TYPES;
const paymentMethods = PAYMENT_METHODS;
const statuses = ["active", "out_of_stock", "discontinued"] as const;
const uploadKinds = ["thumbnail", "gallery", "model"] as const;

const shopColorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

const materialPricingEntrySchema = z.object({
  pricePerGramCents: z.number().int().min(0),
  densityGCm3: z.number().positive(),
});

const calculatorSettingsSchema = z.object({
  machineHourlyRateCents: z.number().int().min(0),
  handlingFeeCents: z.number().int().min(0),
  defaultInfillFactor: z.number().min(0).max(1),
});

const modelPartSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  volumeCm3: z.number().nullable(),
  weightGrams: z.number().int().nullable(),
});

const productTranslationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
});

const categoryTranslationSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
});

const productOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["select", "text", "boolean"]),
  required: z.boolean(),
  choices: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

const productTranslationsSchema = z.object({
  en: productTranslationSchema,
  "pt-BR": productTranslationSchema,
});

const categoryTranslationsSchema = z.object({
  en: categoryTranslationSchema,
  "pt-BR": categoryTranslationSchema,
});

const productWriteBodySchema = z.object({
  slug: z.string().min(2).max(100),
  categoryId: z.string().uuid(),
  basePrice: z.number().int().min(0),
  material: z.enum(materials),
  printTimeHours: z.number().int().min(0),
  weightGrams: z.number().int().min(0),
  status: z.enum(statuses),
  options: z.array(productOptionSchema),
  modelFileUrl: z.string().nullable(),
  modelParts: z.array(modelPartSchema).default([]),
  thumbnailUrl: z.string().min(1),
  imageUrls: z.array(z.string()),
  tags: z.array(z.string()),
  translations: productTranslationsSchema,
});

export const adminLoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const adminProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(statuses).optional(),
  category: z.string().optional(),
  q: z.string().optional(),
});

export const createProductBodySchema = productWriteBodySchema.strict();

export const updateProductBodySchema = productWriteBodySchema.partial().strict();

export const createCategoryBodySchema = z.object({
  slug: z.string().min(2).max(100),
  parentId: z.string().uuid().nullable(),
  imageUrl: z.string().nullable(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  translations: categoryTranslationsSchema,
});

export const updateCategoryBodySchema = createCategoryBodySchema.partial();

export const adminOrderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const adminStoreUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().optional(),
});

export const updateStoreUserAdminBodySchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export const adminUploadKindSchema = z.enum(uploadKinds);

export const adminIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const updateShopSettingsBodySchema = z
  .object({
    whatsappPhone: z.string().min(8).max(20),
    enabledMaterials: z.array(z.enum(materials)).min(1),
    availableColors: z.array(shopColorSchema),
    materialPricing: z.record(z.enum(materials), materialPricingEntrySchema),
    calculator: calculatorSettingsSchema,
    offersDelivery: z.boolean(),
    pickupOnly: z.boolean(),
    pickupLocation: z.string().max(500).nullable(),
    paymentMethods: z.array(z.enum(paymentMethods)).min(1),
    requiresDeposit: z.boolean(),
    depositPercent: z.number().int().min(1).max(100).nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.requiresDeposit && value.depositPercent === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "depositPercent is required when requiresDeposit is true",
        path: ["depositPercent"],
      });
    }
    if (!value.requiresDeposit && value.depositPercent !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "depositPercent must be null when requiresDeposit is false",
        path: ["depositPercent"],
      });
    }
    if (value.pickupOnly && !value.offersDelivery && !value.pickupLocation?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "pickupLocation is required when pickup only",
        path: ["pickupLocation"],
      });
    }
  });
