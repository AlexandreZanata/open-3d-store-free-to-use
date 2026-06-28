import {
  formatTelefone,
  validateTelefone,
  type TelefoneValidationResult,
} from "@br-validators/core/telefone";

export type WhatsAppPhoneError = {
  ok: false;
  code: TelefoneValidationResult extends { ok: false; code: infer C } ? C : string;
  message: string;
};

export type WhatsAppPhoneSuccess = {
  ok: true;
  /** E.164 digits without + — for `wa.me` URLs (`55` + national). */
  waMeDigits: string;
  /** National canonical digits (DDD + local, 10–11 digits). */
  nationalDigits: string;
  /** Brazilian display mask, e.g. `(65) 99999-9999`. */
  display: string;
  tipo: "celular" | "fixo";
};

export type WhatsAppPhoneResult = WhatsAppPhoneSuccess | WhatsAppPhoneError;

/**
 * Validates a Brazilian phone and normalizes it for WhatsApp deep links.
 * Accepts masked input, `+55`, or national digits.
 */
export function parseWhatsAppPhone(input: string): WhatsAppPhoneResult {
  const validated = validateTelefone(input);
  if (!validated.ok) {
    return {
      ok: false,
      code: validated.code,
      message: validated.message,
    };
  }

  const formatted = formatTelefone(validated.value);
  const display = formatted.ok ? formatted.formatted : validated.value;

  return {
    ok: true,
    waMeDigits: `55${validated.value}`,
    nationalDigits: validated.value,
    display,
    tipo: validated.tipo,
  };
}

/** Alias for {@link parseWhatsAppPhone}. */
export function validateWhatsAppPhone(input: string): WhatsAppPhoneResult {
  return parseWhatsAppPhone(input);
}

/** Returns masked display string, or `null` when invalid. */
export function formatWhatsAppPhoneDisplay(input: string): string | null {
  const parsed = parseWhatsAppPhone(input);
  return parsed.ok ? parsed.display : null;
}
