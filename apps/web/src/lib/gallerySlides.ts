/** Build ordered, deduplicated gallery slide URLs (thumbnail first). */
export function buildGallerySlides(thumbnailUrl: string, imageUrls: string[]): string[] {
  const seen = new Set<string>();
  const slides: string[] = [];

  for (const url of [thumbnailUrl, ...imageUrls]) {
    if (!url || seen.has(url)) {
      continue;
    }
    seen.add(url);
    slides.push(url);
  }

  return slides;
}
