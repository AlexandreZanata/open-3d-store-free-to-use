import { vi } from "vitest";

import type { ICacheService } from "../../../src/application/ports/ICacheService.js";
import type { IProductRepository } from "../../../src/domain/repositories/IProductRepository.js";
import type { Product } from "@print3d/shared-types";

export const sampleProduct: Product = {
  id: "01935abc-def0-7890-abcd-ef1234567890",
  slug: "custom-photo-frame",
  name: "Custom Photo Frame",
  description: "Full description",
  shortDescription: "Photo frame with embossed name",
  categoryId: "01934abc-def0-7890-abcd-ef1234567890",
  basePrice: 4500,
  material: "PETG",
  printTimeHours: 4,
  weightGrams: 120,
  status: "active",
  options: [
    {
      id: "color",
      name: "Color",
      type: "select",
      required: true,
      choices: ["White", "Black"],
    },
    {
      id: "name",
      name: "Name to engrave",
      type: "text",
      required: true,
    },
  ],
  modelFileUrl: "/models/3d/custom-photo-frame.glb",
  thumbnailUrl: "/models/thumbnails/photo-frame.webp",
  imageUrls: ["/models/thumbnails/photo-frame.webp"],
  tags: ["gifts", "custom"],
};

export const sampleProductPt: Product = {
  ...sampleProduct,
  name: "Porta-retrato personalizado",
  shortDescription: "Porta-retrato com nome em relevo",
  description: "Descrição completa",
};

export function createMockCache(
  initial: Record<string, unknown> = {},
): ICacheService & { store: Map<string, string> } {
  const store = new Map<string, string>(
    Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)]),
  );

  return {
    store,
    get: vi.fn(async <T>(key: string) => {
      const raw = store.get(key);
      return raw === undefined ? null : (JSON.parse(raw) as T);
    }),
    set: vi.fn(async (key, value) => {
      store.set(key, JSON.stringify(value));
    }),
    del: vi.fn(async (key) => {
      store.delete(key);
    }),
    flush: vi.fn(async () => {
      store.clear();
    }),
  };
}

export function createMockProductRepository(
  overrides: Partial<IProductRepository> = {},
): IProductRepository {
  return {
    findBySlug: vi.fn(),
    findById: vi.fn(),
    findMany: vi.fn(),
    search: vi.fn(),
    findByIds: vi.fn(),
    ...overrides,
  };
}
