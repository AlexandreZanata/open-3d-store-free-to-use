import type { OrderLineItem } from "@print3d/shared-types";

import { formatBrlCents, formatOrderDisplayId } from "./format.js";

export type WhatsAppLineItem = Pick<
  OrderLineItem,
  "productName" | "quantity" | "selectedOptions" | "unitPrice"
>;

export type MessageTemplateOptions = {
  orderId: string;
  items: WhatsAppLineItem[];
  totalCents: number;
  customerName?: string;
  customerNote?: string;
};

function formatLineItem(item: WhatsAppLineItem): string {
  const optionLines = Object.entries(item.selectedOptions)
    .map(([key, value]) => `  • ${key}: ${value}`)
    .join("\n");

  const subtotalCents = item.quantity * item.unitPrice;
  const header = `▪ ${item.quantity}x ${item.productName}`;
  const optionsBlock = optionLines.length > 0 ? `\n${optionLines}` : "";
  const subtotal = `\n  Subtotal: ${formatBrlCents(subtotalCents)}`;

  return `${header}${optionsBlock}${subtotal}`;
}

export function buildWhatsAppMessage(options: MessageTemplateOptions): string {
  const lines: string[] = [
    "🖨️ *Pedido - Impressão 3D*",
    "",
  ];

  if (options.customerName !== undefined && options.customerName.length > 0) {
    lines.push(`*Cliente:* ${options.customerName}`, "");
  }

  lines.push(
    `*Nº do pedido:* ${formatOrderDisplayId(options.orderId)}`,
    "",
    "*Itens:*",
    ...options.items.map(formatLineItem),
    "",
    `*Total estimado: ${formatBrlCents(options.totalCents)}*`,
  );

  if (options.customerNote !== undefined && options.customerNote.length > 0) {
    lines.push("", `*Observação:* ${options.customerNote}`);
  }

  lines.push("", "_Olá! Gostaria de confirmar este pedido._");

  return lines.join("\n");
}
