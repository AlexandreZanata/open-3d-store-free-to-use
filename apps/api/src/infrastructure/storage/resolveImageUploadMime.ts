import path from "node:path";

import type { AdminUploadImageInputMime } from "@print3d/shared-types";
import { ADMIN_UPLOAD_IMAGE_INPUT_MIMES } from "@print3d/shared-types";

const MIME_ALIASES: Record<string, AdminUploadImageInputMime> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
};

const EXTENSION_TO_MIME: Record<string, AdminUploadImageInputMime> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

function isAllowed(mimeType: string): mimeType is AdminUploadImageInputMime {
  return ADMIN_UPLOAD_IMAGE_INPUT_MIMES.includes(mimeType as AdminUploadImageInputMime);
}

function sniffImageMime(data: Buffer): AdminUploadImageInputMime | null {
  if (data.length >= 8 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e) {
    return "image/png";
  }
  if (data.length >= 2 && data[0] === 0xff && data[1] === 0xd8) {
    return "image/jpeg";
  }
  if (
    data.length >= 12 &&
    data.toString("ascii", 0, 4) === "RIFF" &&
    data.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function resolveImageUploadMime(
  mimeType: string,
  filename: string,
  data: Buffer,
): AdminUploadImageInputMime {
  const lowered = mimeType.toLowerCase().trim();
  const aliased = MIME_ALIASES[lowered] ?? lowered;

  if (isAllowed(aliased)) {
    return aliased;
  }

  const fromExtension = EXTENSION_TO_MIME[path.extname(filename).toLowerCase()];
  if (fromExtension) {
    return fromExtension;
  }

  if (lowered === "application/octet-stream" || lowered === "") {
    const sniffed = sniffImageMime(data);
    if (sniffed) {
      return sniffed;
    }
  }

  throw new Error(`MIME type not allowed: ${mimeType || "unknown"}`);
}
