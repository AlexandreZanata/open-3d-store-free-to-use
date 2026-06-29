import type { AdminUploadMimeType } from "@print3d/shared-types";

const EXTENSION_TO_MIME: Record<string, AdminUploadMimeType> = {
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".3mf": "model/3mf",
  ".stl": "model/stl",
};

const OCTET_STREAM = new Set(["application/octet-stream", "binary/octet-stream"]);

export function resolveModelUploadMime(
  filename: string,
  reportedMime: string,
): AdminUploadMimeType | null {
  const extension = filename.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
  const fromExtension = EXTENSION_TO_MIME[extension];
  if (fromExtension) {
    return fromExtension;
  }

  const normalized = reportedMime.toLowerCase().split(";")[0]?.trim() ?? "";
  if (OCTET_STREAM.has(normalized) && fromExtension) {
    return fromExtension;
  }

  if (
    normalized === "model/gltf-binary" ||
    normalized === "model/gltf+json" ||
    normalized === "model/3mf" ||
    normalized === "model/stl" ||
    normalized === "application/sla" ||
    normalized === "application/vnd.ms-pki.stl"
  ) {
    if (normalized === "application/sla" || normalized === "application/vnd.ms-pki.stl") {
      return "model/stl";
    }
    return normalized as AdminUploadMimeType;
  }

  return null;
}
