import { DomainError } from "../errors/DomainError.js";

export type SupportedLocale = "en" | "pt-BR";

const SUPPORTED_LOCALES: readonly SupportedLocale[] = ["en", "pt-BR"];
const DEFAULT_LOCALE: SupportedLocale = "pt-BR";

export class Locale {
  private constructor(private readonly value: SupportedLocale) {}

  static parse(input: string | undefined | null): Locale {
    if (input === undefined || input === null || input.trim() === "") {
      return new Locale(DEFAULT_LOCALE);
    }

    const normalized = normalizeLocaleInput(input);
    if (!isSupportedLocale(normalized)) {
      throw new DomainError(`Unsupported locale: ${input}`);
    }

    return new Locale(normalized);
  }

  toString(): SupportedLocale {
    return this.value;
  }

  getFallbackChain(): SupportedLocale[] {
    const chain: SupportedLocale[] = [this.value];
    for (const locale of SUPPORTED_LOCALES) {
      if (!chain.includes(locale)) {
        chain.push(locale);
      }
    }
    return chain;
  }
}

function normalizeLocaleInput(input: string): string {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "pt" || lower === "pt-br") {
    return "pt-BR";
  }
  if (lower === "en") {
    return "en";
  }

  return trimmed;
}

function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
