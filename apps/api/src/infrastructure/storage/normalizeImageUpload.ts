import sharp from "sharp";

import { ADMIN_UPLOAD_IMAGE_INPUT_MIMES } from "@print3d/shared-types";

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
): Promise<NormalizedImageUpload> {
  if (!isAllowedImageInputMime(mimeType)) {
    throw new Error(`MIME type not allowed: ${mimeType}`);
  }

  if (mimeType === "image/webp") {
    return { data, mimeType: "image/webp" };
  }

  const webpData = await sharp(data).webp().toBuffer();
  return { data: webpData, mimeType: "image/webp" };
}
