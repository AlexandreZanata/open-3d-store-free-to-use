import { buildWhatsAppMessage } from "./message-template.js";

export type WhatsAppLinkOptions = {
  phoneNumber: string;
  orderId: string;
  items: Parameters<typeof buildWhatsAppMessage>[0]["items"];
  totalCents: number;
  customerName?: string;
  customerNote?: string;
};

export function generateWhatsAppLink(options: WhatsAppLinkOptions): string {
  const message = buildWhatsAppMessage({
    orderId: options.orderId,
    items: options.items,
    totalCents: options.totalCents,
    ...(options.customerName !== undefined ? { customerName: options.customerName } : {}),
    ...(options.customerNote !== undefined ? { customerNote: options.customerNote } : {}),
  });

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${options.phoneNumber}?text=${encoded}`;
}

export type { WhatsAppLineItem } from "./message-template.js";
export { buildWhatsAppMessage } from "./message-template.js";
export { formatBrlCents, formatOrderDisplayId } from "./format.js";
