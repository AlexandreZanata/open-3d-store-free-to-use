import { ADMIN_UPLOAD_IMAGE_INPUT_MIMES } from "@print3d/shared-types";

const IMAGE_ACCEPT = ADMIN_UPLOAD_IMAGE_INPUT_MIMES.join(",");

export const UPLOAD_ACCEPT_BY_KIND = {
  thumbnail: IMAGE_ACCEPT,
  gallery: IMAGE_ACCEPT,
  model: ".glb,.gltf,.3mf,model/gltf-binary,model/gltf+json,model/3mf",
} as const;

export const IMAGE_UPLOAD_HINT = "WebP, JPEG, or PNG from your computer (stored as WebP).";
