const DEFAULT_ASSETS_BASE = "http://localhost:5173";

export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path) {
    return "";
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = import.meta.env.VITE_ASSETS_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_ASSETS_BASE;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
