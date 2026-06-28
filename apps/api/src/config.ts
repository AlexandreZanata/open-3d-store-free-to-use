import { parseWhatsAppPhone } from "@print3d/whatsapp";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1024).max(65535).default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  WHATSAPP_PHONE_NUMBER: z.string().min(8),
  CORS_ORIGIN: z.string().url(),
  MODEL_FILES_BASE_PATH: z.string().min(1),
  MODEL_FILES_BASE_URL: z.string().url(),
  ADMIN_SESSION_TTL: z.coerce.number().int().positive().default(28_800),
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(5_242_880),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  const phone = parseWhatsAppPhone(parsed.data.WHATSAPP_PHONE_NUMBER);
  if (!phone.ok) {
    throw new Error(`Invalid WHATSAPP_PHONE_NUMBER: ${phone.message}`);
  }

  return parsed.data;
}
