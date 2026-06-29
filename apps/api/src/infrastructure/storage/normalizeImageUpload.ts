import sharp from "sharp";

import type { AdminUploadImageInputMime } from "@print3d/shared-types";
import { ADMIN_UPLOAD_IMAGE_INPUT_MIMES } from "@print3d/shared-types";

import { resolveImageUploadMime } from "./resolveImageUploadMime.js";

export type NormalizedImageUpload = {
  data: Buffer;
  mimeType: "image/webp";
};

export function isAllowedImageInputMime(mimeType: string): boolean {
  return ADMIN_UPLOAD_IMAGE_INPUT_MIMES.includes(
    mimeType as (typeof ADMIN_UPLOAD_IMAGE_INPUT_MIMES)[number],
  );
}

export async function normalizeImageUpload(
  data: Buffer,
  mimeType: string,
  filename: string,
): Promise<NormalizedImageUpload> {
  const resolvedMime = resolveImageUploadMime(mimeType, filename, data);

  if (resolvedMime === "image/webp") {
    return { data, mimeType: "image/webp" };
  }

  const webpData = await sharp(data).webp().toBuffer();
  return { data: webpData, mimeType: "image/webp" };
}
