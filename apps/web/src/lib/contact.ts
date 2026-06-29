import { formatWhatsAppPhoneDisplay, parseWhatsAppPhone } from "@print3d/whatsapp";

import { readEnvString } from "@/lib/env";

export const CONTACT_GITHUB_URL = "https://github.com/AlexandreZanata";
export const CONTACT_EMAIL = "alexandrezanatavasconcelos@gmail.com";

export function readWhatsAppPhoneDigits(): string | null {
  const raw = readEnvString("VITE_WHATSAPP_PHONE");
  if (!raw) return null;

  const parsed = parseWhatsAppPhone(raw);
  if (parsed.ok) return parsed.waMeDigits;

  const digits = raw.replace(/\D/g, "");
  return digits.length >= 8 ? digits : null;
}

export function readWhatsAppPhoneDisplay(): string | null {
  const raw = readEnvString("VITE_WHATSAPP_PHONE");
  if (!raw) return null;
  return formatWhatsAppPhoneDisplay(raw) ?? raw;
}

export function buildWhatsAppContactHref(message: string): string | null {
  const digits = readWhatsAppPhoneDigits();
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
