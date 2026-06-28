import { buildWhatsAppMessage } from "./message-template.js";
import { parseWhatsAppPhone } from "./phone.js";

export type WhatsAppLinkOptions = {
  /** Brazilian phone — masked, national, or E.164 without `+`. */
  phoneNumber: string;
  orderId: string;
  items: Parameters<typeof buildWhatsAppMessage>[0]["items"];
  totalCents: number;
  customerName?: string;
  customerNote?: string;
};

export class InvalidWhatsAppPhoneError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "InvalidWhatsAppPhoneError";
    this.code = code;
  }
}

export function generateWhatsAppLink(options: WhatsAppLinkOptions): string {
  const phone = parseWhatsAppPhone(options.phoneNumber);
  if (!phone.ok) {
    throw new InvalidWhatsAppPhoneError(phone.message, phone.code);
  }

  const message = buildWhatsAppMessage({
    orderId: options.orderId,
    items: options.items,
    totalCents: options.totalCents,
    ...(options.customerName !== undefined ? { customerName: options.customerName } : {}),
    ...(options.customerNote !== undefined ? { customerNote: options.customerNote } : {}),
  });

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone.waMeDigits}?text=${encoded}`;
}

export type { WhatsAppLineItem } from "./message-template.js";
export { buildWhatsAppMessage } from "./message-template.js";
export { formatBrlCents, formatOrderDisplayId } from "./format.js";
