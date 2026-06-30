import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildWhatsAppContactHref,
  CONTACT_EMAIL,
  CONTACT_GITHUB_URL,
  readInstagramUrl,
  readWhatsAppPhoneDisplay,
  readWhatsAppPhoneDigits,
} from "@/lib/contact";

describe("site footer contact (contract: docs/features/responsive-layout.md)", () => {
  const originalPhone = process.env.VITE_WHATSAPP_PHONE;
  const originalInstagram = process.env.VITE_INSTAGRAM_URL;

  afterEach(() => {
    if (originalPhone === undefined) {
      delete process.env.VITE_WHATSAPP_PHONE;
    } else {
      process.env.VITE_WHATSAPP_PHONE = originalPhone;
    }
    if (originalInstagram === undefined) {
      delete process.env.VITE_INSTAGRAM_URL;
    } else {
      process.env.VITE_INSTAGRAM_URL = originalInstagram;
    }
    vi.unstubAllEnvs();
  });

  it("exposes fixed GitHub and email links", () => {
    expect(CONTACT_GITHUB_URL).toBe("https://github.com/AlexandreZanata");
    expect(CONTACT_EMAIL).toBe("alexandrezanatavasconcelos@gmail.com");
  });

  it("builds wa.me link for configured phone per environment.md", () => {
    process.env.VITE_WHATSAPP_PHONE = "5565999999999";
    expect(buildWhatsAppContactHref("Hello")).toBe("https://wa.me/5565999999999?text=Hello");
    expect(readWhatsAppPhoneDigits()).toBe("5565999999999");
    expect(readWhatsAppPhoneDisplay()).toBe("(65) 99999-9999");
  });

  it("returns null when WhatsApp phone is not configured", () => {
    delete process.env.VITE_WHATSAPP_PHONE;
    expect(readWhatsAppPhoneDigits()).toBeNull();
    expect(buildWhatsAppContactHref("Hello")).toBeNull();
  });

  it("reads Instagram URL from VITE_INSTAGRAM_URL", () => {
    vi.stubEnv("VITE_INSTAGRAM_URL", "https://www.instagram.com/corvo_3d?igsh=test");
    expect(readInstagramUrl()).toBe("https://www.instagram.com/corvo_3d?igsh=test");
  });

  it("returns null for invalid Instagram URL", () => {
    vi.stubEnv("VITE_INSTAGRAM_URL", "not-a-url");
    expect(readInstagramUrl()).toBeNull();
  });
});
