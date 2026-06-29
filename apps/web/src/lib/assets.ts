import { readEnvString } from "./env";

export function getAssetsBaseUrl(): string {
  return readEnvString("VITE_ASSETS_BASE_URL") ?? "";
}

export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = getAssetsBaseUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
