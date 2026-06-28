import type { SupportedLocale } from "../domain/value-objects/Locale.js";
import { Locale } from "../domain/value-objects/Locale.js";
import enMessages from "./messages/en.json" with { type: "json" };
import ptBrMessages from "./messages/pt-BR.json" with { type: "json" };

type MessageCatalog = typeof enMessages;

const catalogs: Record<SupportedLocale, MessageCatalog> = {
  en: enMessages,
  "pt-BR": ptBrMessages,
};

export function resolveHttpLocale(
  acceptLanguage: string | undefined,
  queryLocale: string | undefined,
): SupportedLocale {
  if (queryLocale !== undefined && queryLocale.trim() !== "") {
    return safeParseLocale(queryLocale);
  }
  if (acceptLanguage !== undefined && acceptLanguage.trim() !== "") {
    const primary = acceptLanguage.split(",")[0]?.trim() ?? "";
    return safeParseLocale(primary);
  }
  return "pt-BR";
}

function safeParseLocale(input: string): SupportedLocale {
  try {
    return Locale.parse(input).toString();
  } catch {
    return "pt-BR";
  }
}

export function translate(
  locale: SupportedLocale,
  key: keyof MessageCatalog["errors"],
  params: Record<string, string> = {},
): { title: string; detail: string } {
  const message = catalogs[locale].errors[key];
  return {
    title: interpolate(message.title, params),
    detail: interpolate(message.detail, params),
  };
}

function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => params[key] ?? "");
}
