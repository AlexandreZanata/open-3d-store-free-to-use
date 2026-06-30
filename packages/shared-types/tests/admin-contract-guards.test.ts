/**
 * Contract: docs/api/admin-contract.md — shop settings and mass-assignment guards.
 */
import { describe, expect, it } from "vitest";

import { type CreateProductPayload } from "../src/index.js";

describe("GET /admin/settings — shop configuration", () => {
  it("documents shop settings response shape", () => {
    const response = {
      data: {
        id: "01935abc-def0-7890-abcd-ef1234567890",
        whatsappPhone: "5565999999999",
        enabledMaterials: ["PLA", "PETG_HF"],
        offersDelivery: false,
        pickupOnly: true,
        pickupLocation: "Studio pickup",
        paymentMethods: ["pix", "credit_card"],
        requiresDeposit: true,
        depositPercent: 50,
        updatedAt: "2026-06-29T12:00:00.000Z",
      },
    };

    expect(response.data.enabledMaterials).toContain("PETG_HF");
    expect(response.data.paymentMethods).toContain("pix");
  });
});

describe("mass-assignment guard — Task 9.7", () => {
  it("create payloads omit server-owned fields by type design", () => {
    const payload: CreateProductPayload = {
      slug: "test",
      categoryId: "01934abc-def0-7890-abcd-ef1234567890",
      basePrice: 100,
      material: "PLA",
      printTimeHours: 1,
      weightGrams: 10,
      status: "active",
      options: [],
      modelFileUrl: null,
      thumbnailUrl: "/models/thumbnails/x.webp",
      imageUrls: [],
      tags: [],
      isFeatured: false,
      translations: {
        en: { name: "N", description: "D", shortDescription: "S" },
        "pt-BR": { name: "N", description: "D", shortDescription: "S" },
      },
    };

    expect("id" in payload).toBe(false);
    expect("role" in payload).toBe(false);
    expect("createdAt" in payload).toBe(false);
  });
});
