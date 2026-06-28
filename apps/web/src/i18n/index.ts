import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, resolveBrowserLocale, type SupportedLocale } from "@print3d/shared-types";

import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";
import { initLocaleFromStorage, readStoredLocale } from "../lib/locale";

function resolveInitialLocale(): SupportedLocale {
  return readStoredLocale() ?? resolveBrowserLocale() ?? DEFAULT_LOCALE;
}

const initialLocale = typeof window !== "undefined" ? resolveInitialLocale() : DEFAULT_LOCALE;

if (typeof window !== "undefined") {
  initLocaleFromStorage();
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    "pt-BR": { translation: ptBR },
  },
  lng: initialLocale,
  fallbackLng: "en",
  supportedLngs: ["en", "pt-BR"],
  interpolation: { escapeValue: false },
});

export default i18n;

export function syncI18nLocale(locale: SupportedLocale): void {
  void i18n.changeLanguage(locale);
}

export function getCurrentI18nLocale(): SupportedLocale {
  const lang = i18n.language;
  return lang === "en" || lang === "pt-BR" ? lang : DEFAULT_LOCALE;
}
