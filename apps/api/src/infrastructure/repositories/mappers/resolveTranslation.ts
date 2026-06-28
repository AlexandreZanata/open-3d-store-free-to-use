import type { SupportedLocale } from "../../../domain/value-objects/Locale.js";
import { Locale } from "../../../domain/value-objects/Locale.js";

export type CatalogTranslationFields = {
  name: string;
  description?: string;
  shortDescription?: string;
};

export type CatalogTranslations = Partial<
  Record<SupportedLocale, CatalogTranslationFields>
>;

export function resolveCatalogText(
  translations: CatalogTranslations,
  locale: SupportedLocale,
  field: keyof CatalogTranslationFields,
  fallback = "",
): string {
  const chain = Locale.parse(locale).getFallbackChain();
  for (const loc of chain) {
    const value = translations[loc]?.[field];
    if (value !== undefined && value !== "") {
      return value;
    }
  }
  return fallback;
}
