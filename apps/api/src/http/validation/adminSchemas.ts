import { z } from "zod";

const materials = ["PLA", "PETG", "ABS", "TPU", "RESIN"] as const;
const statuses = ["active", "out_of_stock", "discontinued"] as const;
const uploadKinds = ["thumbnail", "gallery", "model"] as const;

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

export const adminUploadKindSchema = z.enum(uploadKinds);

export const adminIdParamSchema = z.object({
  id: z.string().uuid(),
});
