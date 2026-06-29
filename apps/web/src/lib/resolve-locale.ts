import {
  DEFAULT_LOCALE,
  parseLocale,
  resolveBrowserLocale,
  type SupportedLocale,
} from "@print3d/shared-types";

export const LOCALE_COOKIE_NAME = "locale";
export const LOCALE_STORAGE_KEY = "locale";

export function readLocaleCookie(cookieHeader: string | null | undefined): SupportedLocale | null {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE_NAME}=([^;]+)`));
  if (!match?.[1]) {
    return null;
  }

  return parseLocale(decodeURIComponent(match[1]));
}

export function writeLocaleCookie(locale: SupportedLocale): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
}

function readStoredLocale(): SupportedLocale | null {
  if (typeof localStorage === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  return parseLocale(stored);
}

export function resolveAcceptLanguageLocale(acceptLanguage: string | null | undefined): SupportedLocale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  const lower = acceptLanguage.toLowerCase();
  if (lower.includes("pt")) {
    return "pt-BR";
  }
  if (lower.includes("en")) {
    return "en";
  }

  return DEFAULT_LOCALE;
}

export function resolveRequestLocale(
  acceptLanguage?: string | null,
  cookieHeader?: string | null,
): SupportedLocale {
  return readLocaleCookie(cookieHeader) ?? resolveAcceptLanguageLocale(acceptLanguage);
}

export function resolveClientLocale(): SupportedLocale {
  const fromCookie = typeof document !== "undefined" ? readLocaleCookie(document.cookie) : null;
  if (fromCookie) {
    return fromCookie;
  }

  const fromStorage = readStoredLocale();
  if (fromStorage) {
    writeLocaleCookie(fromStorage);
    return fromStorage;
  }

  return resolveBrowserLocale();
}
