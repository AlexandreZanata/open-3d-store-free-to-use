/** Session cache — thumbnails stay warm across home ↔ catalog navigation. */
const warmedUrls = new Set<string>();
const warmImages = new Map<string, HTMLImageElement>();

export function isCatalogThumbnailWarm(url: string): boolean {
  return url.length > 0 && warmedUrls.has(url);
}

export function markCatalogThumbnailWarm(url: string): void {
  if (url) {
    warmedUrls.add(url);
  }
}

/** Keep decoded bitmaps reachable while the SPA session is open. */
export function warmCatalogThumbnail(url: string): void {
  if (typeof window === "undefined" || !url || warmedUrls.has(url)) {
    return;
  }
  warmedUrls.add(url);
  if (warmImages.has(url)) {
    return;
  }
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  warmImages.set(url, img);
}

export function warmCatalogThumbnails(urls: readonly string[], limit = 32): void {
  let count = 0;
  for (const url of urls) {
    if (!url || count >= limit) {
      continue;
    }
    warmCatalogThumbnail(url);
    count += 1;
  }
}
