import type { AdminDataResponse } from "./admin.types.js";

export type AdminUploadKind = "thumbnail" | "gallery" | "model";

export type AdminUploadMimeType =
  | "image/webp"
  | "model/gltf-binary"
  | "model/gltf+json"
  | "model/3mf"
  | "model/stl";

export const ADMIN_UPLOAD_MODEL_INPUT_EXTENSIONS = [
  ".glb",
  ".gltf",
  ".3mf",
  ".stl",
] as const;

/** MIME types accepted on upload for thumbnail/gallery (stored as WebP). */
export const ADMIN_UPLOAD_IMAGE_INPUT_MIMES = [
  "image/webp",
  "image/jpeg",
  "image/png",
] as const;

export type AdminUploadImageInputMime = (typeof ADMIN_UPLOAD_IMAGE_INPUT_MIMES)[number];

export const ADMIN_UPLOAD_MIME_ALLOWLIST: readonly AdminUploadMimeType[] = [
  "image/webp",
  "model/gltf-binary",
  "model/gltf+json",
  "model/3mf",
  "model/stl",
] as const;

export const ADMIN_UPLOAD_MAX_BYTES: Readonly<Record<AdminUploadKind, number>> = {
  thumbnail: 512 * 1024,
  gallery: 2 * 1024 * 1024,
  model: 256 * 1024 * 1024,
} as const;

export type AdminUploadResult = {
  url: string;
  mimeType: AdminUploadMimeType;
  sizeBytes: number;
  kind: AdminUploadKind;
  jobId?: string;
};

export type AdminUploadResponse = AdminDataResponse<AdminUploadResult>;
