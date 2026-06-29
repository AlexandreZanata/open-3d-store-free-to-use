/** Human-readable part label for storefront color picker (hide upload UUID stems). */
export function formatModelPartName(filenameStem: string, index = 0): string {
  const trimmed = filenameStem.trim();
  const isOpaqueId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed) ||
    /^[0-9a-f]{20,}$/i.test(trimmed);

  if (isOpaqueId || trimmed.length === 0) {
    return index === 0 ? "Part 1" : `Part ${index + 1}`;
  }

  const words = trimmed.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return words.length > 0 ? words : `Part ${index + 1}`;
}
