import type { SupportedLocale } from "@print3d/shared-types";
import { DEFAULT_LOCALE, parseLocale } from "@print3d/shared-types";

const LOCALE_STORAGE_KEY = "locale";

let activeLocale: SupportedLocale = DEFAULT_LOCALE;

export function getActiveLocale(): SupportedLocale {
  return activeLocale;
}

export function readStoredLocale(): SupportedLocale | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (!stored) {
    return null;
  }
  return parseLocale(stored);
}

export function persistLocale(locale: SupportedLocale): void {
  activeLocale = locale;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

export function initLocaleFromStorage(): SupportedLocale {
  const stored = readStoredLocale();
  if (stored) {
    activeLocale = stored;
    return stored;
  }
  return activeLocale;
}

export function setActiveLocale(locale: SupportedLocale): void {
  persistLocale(locale);
}

export { LOCALE_STORAGE_KEY };
