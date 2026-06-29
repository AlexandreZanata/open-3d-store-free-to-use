import { z } from "zod";

const storeCartItemSchema = z.object({
  productId: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  thumbnailUrl: z.string(),
  basePriceDisplay: z.string().min(1),
  quantity: z.number().int().min(1),
  selectedOptions: z.record(z.string()),
});

export const storeRegisterBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().trim().min(1).max(80),
  cart: z.array(storeCartItemSchema).optional(),
});

export const storeLoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  cart: z.array(storeCartItemSchema).optional(),
});

export const storeUpdateProfileBodySchema = z.object({
  displayName: z.string().trim().min(1).max(80),
});

export const storeSaveCartBodySchema = z.object({
  cart: z.array(storeCartItemSchema),
});

const deviceIdSchema = z.string().uuid();

export function readDeviceId(
  header: string | string[] | undefined,
): string | null {
  const value = Array.isArray(header) ? header[0] : header;
  const parsed = deviceIdSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function readVisitorIdHeader(
  header: string | string[] | undefined,
): string | null {
  const value = Array.isArray(header) ? header[0] : header;
  const parsed = z.string().uuid().safeParse(value);
  return parsed.success ? parsed.data : null;
}
