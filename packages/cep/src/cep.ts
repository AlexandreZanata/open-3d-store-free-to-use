import {
  CEP_FAIXA_DATA_VERSION,
  formatCep,
  getCepFaixaInfo,
  getCepFaixas,
  validateCep,
  type CepFaixa,
  type ValidationResult,
} from "@br-validators/core/cep";

export type CepError = {
  ok: false;
  code: string;
  message: string;
};

export type CepSuccess = {
  ok: true;
  /** Eight-digit CEP (digits only). */
  digits: string;
  /** Masked display, e.g. `01310-100`. */
  display: string;
};

export type CepParseResult = CepSuccess | CepError;

export type CepLocation = {
  cep: string;
  display: string;
  prefixo: string;
  uf: string;
  codigoIbge: number;
  cidade: string;
};

export type CepLookupResult =
  | { ok: true; location: CepLocation }
  | CepError;

/** Validates and normalizes a Brazilian CEP (Correios format). */
export function parseCep(input: string): CepParseResult {
  const validated = validateCep(input);
  if (!validated.ok) {
    return {
      ok: false,
      code: validated.code,
      message: validated.message,
    };
  }

  const formatted = formatCep(validated.value);
  const display = formatted.ok ? formatted.formatted : validated.value;

  return {
    ok: true,
    digits: validated.value,
    display,
  };
}

/** Alias for {@link parseCep}. */
export function validateBrazilianCep(input: string): CepParseResult {
  return parseCep(input);
}

/** Returns masked display string, or `null` when invalid. */
export function formatCepDisplay(input: string): string | null {
  const parsed = parseCep(input);
  return parsed.ok ? parsed.display : null;
}

/**
 * Offline CEP lookup by IBGE CNEFE prefix (first 5 digits).
 * Returns UF, municipality name, and IBGE city code when known.
 */
export function lookupCep(input: string): CepLookupResult {
  const parsed = parseCep(input);
  if (!parsed.ok) {
    return parsed;
  }

  const prefixo = parsed.digits.slice(0, 5);
  const faixa = getCepFaixaInfo(prefixo);
  if (faixa === undefined) {
    return {
      ok: false,
      code: "PREFIX_NOT_FOUND",
      message: `No embedded location data for CEP prefix ${prefixo}`,
    };
  }

  return {
    ok: true,
    location: {
      cep: parsed.digits,
      display: parsed.display,
      prefixo: faixa.prefixo,
      uf: faixa.uf,
      codigoIbge: faixa.codigoIbge,
      cidade: faixa.cidade,
    },
  };
}

/** Lookup by 5-digit CEP prefix (e.g. `01310`). */
export function lookupCepPrefix(prefix: string): CepFaixa | undefined {
  const digits = prefix.replace(/\D/g, "").slice(0, 5);
  if (digits.length !== 5) {
    return undefined;
  }
  return getCepFaixaInfo(digits);
}

/** All embedded CEP prefix ranges (~24k rows, IBGE CNEFE 2022). */
export function listCepFaixas(): readonly CepFaixa[] {
  return getCepFaixas();
}

/** Dataset metadata (capture date, row counts, source URLs). */
export { CEP_FAIXA_DATA_VERSION };

export type { CepFaixa, ValidationResult };
