import { describe, expect, it } from "vitest";

import {
  formatWhatsAppPhoneDisplay,
  generateWhatsAppLink,
  InvalidWhatsAppPhoneError,
  parseWhatsAppPhone,
} from "../src/index.js";

describe("parseWhatsAppPhone", () => {
  it("normalizes E.164 digits to wa.me format", () => {
    const result = parseWhatsAppPhone("5565999999999");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.waMeDigits).toBe("5565999999999");
      expect(result.nationalDigits).toBe("65999999999");
      expect(result.display).toBe("(65) 99999-9999");
      expect(result.tipo).toBe("celular");
    }
  });

  it("accepts masked national input", () => {
    const result = parseWhatsAppPhone("(65) 99999-9999");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.waMeDigits).toBe("5565999999999");
    }
  });

  it("rejects invalid phone numbers", () => {
    const result = parseWhatsAppPhone("not-a-phone");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("INVALID_CHARACTER");
    }
  });
});

describe("formatWhatsAppPhoneDisplay", () => {
  it("returns masked display for valid input", () => {
    expect(formatWhatsAppPhoneDisplay("65999999999")).toBe("(65) 99999-9999");
  });

  it("returns null for invalid input", () => {
    expect(formatWhatsAppPhoneDisplay("invalid")).toBeNull();
  });
});

describe("generateWhatsAppLink phone validation", () => {
  it("builds link from masked phone input", () => {
    const link = generateWhatsAppLink({
      phoneNumber: "(65) 99999-9999",
      orderId: "01935abc-def0-7890-abcd-ef1234567890",
      items: [
        {
          productName: "Custom Photo Frame",
          quantity: 1,
          selectedOptions: {},
          unitPrice: 4500,
        },
      ],
      totalCents: 4500,
    });

    expect(link).toMatch(/^https:\/\/wa\.me\/5565999999999\?text=/);
  });

  it("throws InvalidWhatsAppPhoneError for invalid phone", () => {
    expect(() =>
      generateWhatsAppLink({
        phoneNumber: "invalid",
        orderId: "01935abc-def0-7890-abcd-ef1234567890",
        items: [
          {
            productName: "Test",
            quantity: 1,
            selectedOptions: {},
            unitPrice: 100,
          },
        ],
        totalCents: 100,
      }),
    ).toThrow(InvalidWhatsAppPhoneError);
  });
});
