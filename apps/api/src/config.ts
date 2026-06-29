import { parseWhatsAppPhone } from "@print3d/whatsapp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const API_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveWritableModelPath(configured: string, nodeEnv: string): string {
  const resolved = path.isAbsolute(configured)
    ? configured
    : path.resolve(API_ROOT, configured);

  if (nodeEnv === "production") {
    return resolved;
  }

  try {
    fs.mkdirSync(resolved, { recursive: true });
    fs.accessSync(resolved, fs.constants.W_OK);
    return resolved;
  } catch {
    const fallback = path.join(API_ROOT, "storage", "models");
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1024).max(65535).default(6200),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  WHATSAPP_PHONE_NUMBER: z.string().min(8),
  CORS_ORIGIN: z.string().url(),
  MODEL_FILES_BASE_PATH: z.string().min(1),
  MODEL_FILES_BASE_URL: z.string().url(),
  ADMIN_SESSION_TTL: z.coerce.number().int().positive().default(28_800),
  ADMIN_SESSION_IDLE_TTL: z.coerce.number().int().positive().default(1800),
  STORE_SESSION_TTL: z.coerce.number().int().positive().default(2_592_000),
  STORE_SESSION_IDLE_TTL: z.coerce.number().int().positive().default(604_800),
  ADMIN_ORIGIN: z.string().url().default("http://127.0.0.1:6202"),
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

  return {
    ...parsed.data,
    MODEL_FILES_BASE_PATH: resolveWritableModelPath(
      parsed.data.MODEL_FILES_BASE_PATH,
      parsed.data.NODE_ENV,
    ),
  };
}
