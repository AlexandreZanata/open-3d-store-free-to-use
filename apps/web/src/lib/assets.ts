import { readEnvString } from "./env";

const DEFAULT_ASSETS_BASE = "http://localhost:5173";

export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const rawBase = readEnvString("VITE_ASSETS_BASE_URL") ?? DEFAULT_ASSETS_BASE;
  const base = rawBase.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
