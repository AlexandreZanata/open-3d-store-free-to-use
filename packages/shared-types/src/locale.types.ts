export type SupportedLocale = "en" | "pt-BR";

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ["en", "pt-BR"];

export const DEFAULT_LOCALE: SupportedLocale = "pt-BR";

export function parseLocale(input: string | null | undefined): SupportedLocale {
  if (input === "en" || input === "pt-BR") {
    return input;
  }
  if (input === "pt") {
    return "pt-BR";
  }
  return DEFAULT_LOCALE;
}

export function resolveBrowserLocale(): SupportedLocale {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }
  const lang = navigator.language;
  if (lang.startsWith("pt")) {
    return "pt-BR";
  }
  if (lang.startsWith("en")) {
    return "en";
  }
  return DEFAULT_LOCALE;
}
