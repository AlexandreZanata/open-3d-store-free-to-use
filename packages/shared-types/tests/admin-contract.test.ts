/**
 * Contract: docs/api/admin-contract.md — examples MUST match documented JSON shapes.
 * Task 9.7 review gate: MIME allowlist, mass-assignment fields, schema mapping.
 */
import { describe, expect, it } from "vitest";

import {
  ADMIN_UPLOAD_IMAGE_INPUT_MIMES,
  ADMIN_UPLOAD_MAX_BYTES,
  ADMIN_UPLOAD_MIME_ALLOWLIST,
  type AdminLoginRequest,
  type AdminLoginResponse,
  type AdminOrderDetailResponse,
  type AdminUploadResponse,
  type CreateCategoryPayload,
  type CreateProductPayload,
} from "../src/index.js";

describe("POST /admin/auth/login — docs/api/admin-contract.md", () => {
  it("accepts documented request body", () => {
    const body = {
      email: "admin@example.com",
      password: "change-me-in-dev",
    } satisfies AdminLoginRequest;

    expect(body.email).toContain("@");
  });

  it("returns documented response shape with admin role", () => {
    const response = {
      data: {
        id: "01935abc-def0-7890-abcd-ef1234567890",
        email: "admin@example.com",
        role: "admin",
        lastLoginAt: "2026-06-28T12:00:00.000Z",
      },
    } satisfies AdminLoginResponse;

    expect(response.data.role).toBe("admin");
  });
});

describe("POST /admin/products — schema mapping", () => {
  it("create payload maps to products table columns and translations JSONB", () => {
    const payload = {
      slug: "custom-photo-frame",
      categoryId: "01934abc-def0-7890-abcd-ef1234567890",
      basePrice: 4500,
      material: "PETG",
      printTimeHours: 4,
      weightGrams: 120,
      status: "active",
      options: [],
      modelFileUrl: null,
      thumbnailUrl: "/models/thumbnails/photo-frame.webp",
      imageUrls: [],
      tags: [],
      translations: {
        en: {
          name: "Custom Photo Frame",
          description: "Full description…",
          shortDescription: "Photo frame with embossed name",
        },
        "pt-BR": {
          name: "Porta-retrato personalizado",
          description: "Descrição completa…",
          shortDescription: "Porta-retrato com nome em relevo",
        },
      },
    } satisfies CreateProductPayload;

    expect(payload.basePrice).toBeGreaterThanOrEqual(0);
    expect(payload.translations.en.name).toBeTruthy();
    expect(payload.translations["pt-BR"].name).toBeTruthy();
  });
});

describe("POST /admin/categories — soft-delete via isActive", () => {
  it("create payload includes isActive and bilingual translations", () => {
    const payload = {
      slug: "miniatures",
      parentId: null,
      imageUrl: "/models/thumbnails/miniatures.webp",
      sortOrder: 1,
      isActive: true,
      translations: {
        en: { name: "Miniatures", description: "Custom figurines" },
        "pt-BR": { name: "Miniaturas", description: "Figurinhas personalizadas" },
      },
    } satisfies CreateCategoryPayload;

    expect(payload.isActive).toBe(true);
  });
});

describe("GET /admin/orders/:id — read-only detail", () => {
  it("matches documented order detail response", () => {
    const response = {
      data: {
        id: "01935abc-def0-7890-abcd-ef1234567890",
        items: [
          {
            productId: "01935def-7890-abcd-ef12-345678901234",
            productName: "Custom Photo Frame",
            quantity: 2,
            selectedOptions: { Color: "White" },
            unitPrice: 4500,
          },
        ],
        customerName: "Maria",
        customerNote: "Need fast delivery",
        totalCents: 9000,
        totalDisplay: "R$ 90,00",
        whatsappLink: "https://wa.me/5565999999999?text=encoded",
        capturedAt: "2026-06-28T10:00:00.000Z",
      },
    } satisfies AdminOrderDetailResponse;

    expect(response.data.totalDisplay).toBe("R$ 90,00");
  });
});

describe("POST /admin/uploads — MIME allowlist (Task 9.7)", () => {
  it("documents stored MIME types for uploads", () => {
    expect(ADMIN_UPLOAD_MIME_ALLOWLIST).toEqual([
      "image/webp",
      "model/gltf-binary",
      "model/gltf+json",
      "model/3mf",
      "model/stl",
    ]);
  });

  it("documents image input MIME types accepted before WebP conversion", () => {
    expect(ADMIN_UPLOAD_IMAGE_INPUT_MIMES).toEqual([
      "image/webp",
      "image/jpeg",
      "image/png",
    ]);
  });

  it("enforces per-kind size limits from admin contract", () => {
    expect(ADMIN_UPLOAD_MAX_BYTES.thumbnail).toBe(512 * 1024);
    expect(ADMIN_UPLOAD_MAX_BYTES.gallery).toBe(2 * 1024 * 1024);
    expect(ADMIN_UPLOAD_MAX_BYTES.model).toBe(256 * 1024 * 1024);
  });

  it("returns documented upload response shape", () => {
    const response = {
      data: {
        url: "/models/thumbnails/upload-01935.webp",
        mimeType: "image/webp",
        sizeBytes: 42000,
        kind: "thumbnail",
      },
    } satisfies AdminUploadResponse;

    expect(response.data.kind).toBe("thumbnail");
  });
});
