import { describe, expect, it, vi } from "vitest";

import { CaptureOrder } from "../../../src/application/use-cases/CaptureOrder.js";
import {
  MissingRequiredOptionError,
  ProductNotFoundError,
} from "../../../src/application/errors/ApplicationErrors.js";
import type { IShopSettingsRepository } from "../../../src/domain/repositories/IShopSettingsRepository.js";
import type { IOrderCaptureRepository } from "../../../src/domain/repositories/IOrderCaptureRepository.js";
import type { IEventPublisher } from "../../../src/application/ports/IEventPublisher.js";
import { createMockProductRepository, sampleProduct } from "./testHelpers.js";

const phoneNumber = "5565999999999";

function createMockShopSettings(
  whatsappPhone = phoneNumber,
): IShopSettingsRepository {
  return {
    get: vi.fn(async () => ({
      id: "settings-1",
      whatsappPhone,
      enabledMaterials: ["PLA"],
      availableColors: [],
      materialPricing: {},
      calculator: {
        machineHourlyRateCents: 1500,
        handlingFeeCents: 500,
        defaultInfillFactor: 0.2,
      },
      offersDelivery: false,
      pickupOnly: true,
      pickupLocation: null,
      paymentMethods: ["pix"],
      requiresDeposit: false,
      depositPercent: null,
      updatedAt: new Date(),
    })),
    upsert: vi.fn(),
  };
}

describe("CaptureOrder", () => {
  it("returns wa.me link and R$ 90,00 total per POST /orders/capture contract", async () => {
    const products = createMockProductRepository({
      findByIds: vi.fn(async () => [sampleProduct]),
    });
    const orders: IOrderCaptureRepository = {
      save: vi.fn(async () => undefined),
    };
    const useCase = new CaptureOrder(products, orders, createMockShopSettings(), phoneNumber);

    const result = await useCase.execute({
      items: [
        {
          productId: sampleProduct.id,
          quantity: 2,
          selectedOptions: {
            Color: "White",
            "Name to engrave": "John",
          },
        },
      ],
      customerName: "Maria",
    });

    expect(result.whatsappLink).toMatch(/^https:\/\/wa\.me\/5565999999999\?text=/);
    expect(result.totalPrice).toBe("R$ 90,00");
    expect(result.summary).toContain("2x");
    expect(result.summary).toContain("Custom Photo Frame");
  });

  it("freezes unitPrice at capture time per BR-001", async () => {
    const products = createMockProductRepository({
      findByIds: vi.fn(async () => [sampleProduct]),
    });
    let savedTotal = 0;
    const orders: IOrderCaptureRepository = {
      save: vi.fn(async (_capture, totalCents) => {
        savedTotal = totalCents;
      }),
    };
    const useCase = new CaptureOrder(products, orders, createMockShopSettings(), phoneNumber);

    await useCase.execute({
      items: [
        {
          productId: sampleProduct.id,
          quantity: 2,
          selectedOptions: { Color: "White", "Name to engrave": "John" },
        },
      ],
    });

    expect(savedTotal).toBe(9000);
    expect(orders.save).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            unitPrice: 4500,
            productId: sampleProduct.id,
          }),
        ],
      }),
      9000,
    );
  });

  it("throws when product is not found", async () => {
    const products = createMockProductRepository({
      findByIds: vi.fn(async () => []),
    });
    const useCase = new CaptureOrder(
      products,
      { save: vi.fn() },
      createMockShopSettings(),
      phoneNumber,
    );

    await expect(
      useCase.execute({
        items: [
          {
            productId: "missing-id",
            quantity: 1,
            selectedOptions: {},
          },
        ],
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
  });

  it("throws when required product option is missing per BR-003", async () => {
    const products = createMockProductRepository({
      findByIds: vi.fn(async () => [sampleProduct]),
    });
    const useCase = new CaptureOrder(
      products,
      { save: vi.fn() },
      createMockShopSettings(),
      phoneNumber,
    );

    await expect(
      useCase.execute({
        items: [
          {
            productId: sampleProduct.id,
            quantity: 1,
            selectedOptions: { Color: "White" },
          },
        ],
      }),
    ).rejects.toBeInstanceOf(MissingRequiredOptionError);
  });

  it("publishes order.captured domain event", async () => {
    const products = createMockProductRepository({
      findByIds: vi.fn(async () => [sampleProduct]),
    });
    const events: IEventPublisher = {
      publish: vi.fn(async () => undefined),
    };
    const useCase = new CaptureOrder(
      products,
      { save: vi.fn() },
      createMockShopSettings(),
      phoneNumber,
      events,
    );

    await useCase.execute({
      items: [
        {
          productId: sampleProduct.id,
          quantity: 1,
          selectedOptions: { Color: "White", "Name to engrave": "John" },
        },
      ],
    });

    expect(events.publish).toHaveBeenCalledWith({
      type: "order.captured",
      payload: expect.objectContaining({
        itemCount: 1,
        totalCents: 4500,
      }),
    });
  });
});
