export function readAttr(tag: string, name: string): number | null {
  const raw = readAttrString(tag, name);
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function readAttrString(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}="([^"]+)"`, "i"));
  return match?.[1] ?? null;
}
