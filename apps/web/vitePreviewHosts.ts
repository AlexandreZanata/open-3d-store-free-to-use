/** Vite preview host allowlist — derived from production env (behind nginx). */
export function resolvePreviewAllowedHosts(
  assetsBaseUrl: string | undefined,
): true | string[] {
  if (!assetsBaseUrl) return true;

  try {
    const { hostname } = new URL(assetsBaseUrl);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return true;

    return [hostname, hostname.startsWith("www.") ? hostname.slice(4) : `www.${hostname}`];
  } catch {
    return true;
  }
}

export function resolveAdminPreviewAllowedHosts(
  apiBaseUrl: string | undefined,
): true | string[] {
  if (!apiBaseUrl) return true;

  try {
    const storefront = new URL(apiBaseUrl.replace(/\/api\/v1\/?$/i, ""));
    const apex = storefront.hostname.replace(/^www\./, "");
    return [...new Set([storefront.hostname, apex, `www.${apex}`, `admin.${apex}`])];
  } catch {
    return true;
  }
}
