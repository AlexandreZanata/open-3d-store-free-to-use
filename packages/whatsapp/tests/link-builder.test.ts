import { describe, expect, it } from "vitest";

import { buildWhatsAppMessage, generateWhatsAppLink } from "../src/link-builder.js";

const baseOptions = {
  phoneNumber: "5565999999999",
  orderId: "01935abc-def0-7890-abcd-ef1234567890",
  items: [
    {
      productName: "Custom Photo Frame",
      quantity: 2,
      selectedOptions: {
        Color: "White",
        "Name to engrave": "John",
      },
      unitPrice: 4500,
    },
  ],
  totalCents: 9000,
} as const;

describe("generateWhatsAppLink", () => {
  it("builds wa.me URL with phone number and text query param", () => {
    const link = generateWhatsAppLink({
      ...baseOptions,
      customerName: "Maria",
      customerNote: "Need fast delivery",
    });

    expect(link).toMatch(/^https:\/\/wa\.me\/5565999999999\?text=/);
  });

  it("URL-encodes special characters in the message", () => {
    const link = generateWhatsAppLink({
      ...baseOptions,
      customerNote: "Entrega rápida & urgente",
    });

    const textParam = link.split("?text=")[1];
    expect(textParam).toBeDefined();
    expect(textParam).not.toContain("& urgente");
    expect(decodeURIComponent(textParam ?? "")).toContain("& urgente");
  });

  it("includes product name in the decoded message body", () => {
    const link = generateWhatsAppLink(baseOptions);
    const textParam = link.split("?text=")[1];
    const message = decodeURIComponent(textParam ?? "");

    expect(message).toContain("Custom Photo Frame");
    expect(message).toContain("2x Custom Photo Frame");
  });

  it("formats BRL total with comma decimal separator", () => {
    const link = generateWhatsAppLink(baseOptions);
    const message = decodeURIComponent(link.split("?text=")[1] ?? "");

    expect(message).toContain("R$ 90,00");
    expect(message).toContain("*Total estimado: R$ 90,00*");
  });

  it("includes customer name when provided", () => {
    const link = generateWhatsAppLink({
      ...baseOptions,
      customerName: "Maria",
    });
    const message = decodeURIComponent(link.split("?text=")[1] ?? "");

    expect(message).toContain("*Cliente:* Maria");
  });

  it("omits customer name line when not provided", () => {
    const link = generateWhatsAppLink(baseOptions);
    const message = decodeURIComponent(link.split("?text=")[1] ?? "");

    expect(message).not.toContain("*Cliente:*");
  });
});

describe("buildWhatsAppMessage", () => {
  it("matches documented template structure", () => {
    const message = buildWhatsAppMessage({
      orderId: baseOptions.orderId,
      items: [...baseOptions.items],
      totalCents: baseOptions.totalCents,
      customerName: "Maria",
      customerNote: "Need fast delivery",
    });

    expect(message).toContain("🖨️ *Pedido - Impressão 3D*");
    expect(message).toContain("*Nº do pedido:* 01935ABC");
    expect(message).toContain("  • Color: White");
    expect(message).toContain("_Olá! Gostaria de confirmar este pedido._");
  });
});
