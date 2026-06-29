export type ProductShareInput = {
  slug: string;
  name: string;
  shortDescription: string;
};

export type ProductSharePayload = {
  title: string;
  text: string;
  url: string;
};

export function buildProductSharePath(slug: string): string {
  return `/product/${encodeURIComponent(slug)}`;
}

export function buildProductShareUrl(slug: string, origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${buildProductSharePath(slug)}`;
}

export function buildProductSharePayload(
  input: ProductShareInput,
  origin: string,
): ProductSharePayload {
  const url = buildProductShareUrl(input.slug, origin);
  return {
    title: input.name,
    text: `${input.name} — ${input.shortDescription}`,
    url,
  };
}

export function formatShareClipboardText(payload: ProductSharePayload): string {
  return `${payload.text}\n${payload.url}`;
}

export function buildWhatsAppShareUrl(payload: ProductSharePayload): string {
  return `https://wa.me/?text=${encodeURIComponent(formatShareClipboardText(payload))}`;
}

export function buildEmailShareUrl(payload: ProductSharePayload): string {
  const body = `${payload.text}\n\n${payload.url}`;
  return `mailto:?subject=${encodeURIComponent(payload.title)}&body=${encodeURIComponent(body)}`;
}

export function canUseNativeShare(payload: ProductSharePayload): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }
  if (typeof navigator.canShare === "function") {
    return navigator.canShare({
      title: payload.title,
      text: payload.text,
      url: payload.url,
    });
  }
  return true;
}

export function isShareCancelled(error: Error): boolean {
  return error.name === "AbortError";
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}
