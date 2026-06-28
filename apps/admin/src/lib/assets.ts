import { readEnvString } from "@/lib/env";

const DEFAULT_ASSETS_BASE = "http://localhost:3001";

export function getAssetsBaseUrl(): string {
  return readEnvString("VITE_ASSETS_BASE_URL") ?? DEFAULT_ASSETS_BASE;
}

export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path || path.length === 0) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getAssetsBaseUrl().replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
