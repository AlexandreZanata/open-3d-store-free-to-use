import { generateWhatsAppLink } from "@print3d/whatsapp";
import type { OrderLineItem } from "@print3d/shared-types";
import { uuidv7 } from "uuidv7";

import type { IOrderCaptureRepository } from "../../domain/repositories/IOrderCaptureRepository.js";
import type { IProductRepository } from "../../domain/repositories/IProductRepository.js";
import { Price } from "../../domain/value-objects/Price.js";
import type { IEventPublisher } from "../ports/IEventPublisher.js";
import {
  MissingRequiredOptionError,
  ProductNotFoundError,
  ProductNotOrderableError,
} from "../errors/ApplicationErrors.js";
import type {
  CaptureOrderInput,
  CaptureOrderResultDto,
} from "../dtos/CaptureOrderDto.js";

const WHATSAPP_CATALOG_LOCALE = "pt-BR" as const;

export class CaptureOrder {
  constructor(
    private readonly products: IProductRepository,
    private readonly orders: IOrderCaptureRepository,
    private readonly whatsappPhoneNumber: string,
    private readonly events?: IEventPublisher,
  ) {}

  async execute(input: CaptureOrderInput): Promise<CaptureOrderResultDto> {
    const productIds = input.items.map((item) => item.productId);
    const products = await this.products.findByIds(
      productIds,
      WHATSAPP_CATALOG_LOCALE,
    );
    const productMap = new Map(products.map((p) => [p.id, p]));

    const lineItems: OrderLineItem[] = [];
    let totalCents = 0;

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (product === undefined) {
        throw new ProductNotFoundError(item.productId);
      }
      if (product.status !== "active") {
        throw new ProductNotOrderableError(item.productId);
      }

      validateRequiredOptions(product, item);

      const unitPrice = product.basePrice;
      lineItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        unitPrice,
      });
      totalCents += unitPrice * item.quantity;
    }

    const orderId = uuidv7();
    const whatsappLink = generateWhatsAppLink({
      phoneNumber: this.whatsappPhoneNumber,
      orderId,
      items: lineItems.map((line) => ({
        productName: line.productName,
        quantity: line.quantity,
        selectedOptions: line.selectedOptions,
        unitPrice: line.unitPrice,
      })),
      totalCents,
      ...(input.customerName !== undefined
        ? { customerName: input.customerName }
        : {}),
      ...(input.customerNote !== undefined
        ? { customerNote: input.customerNote }
        : {}),
    });

    await this.orders.save(
      {
        id: orderId,
        items: lineItems,
        capturedAt: new Date(),
        whatsappLink,
        ...(input.customerName !== undefined
          ? { customerName: input.customerName }
          : {}),
        ...(input.customerNote !== undefined
          ? { customerNote: input.customerNote }
          : {}),
      },
      totalCents,
    );

    await this.events?.publish({
      type: "order.captured",
      payload: {
        orderId,
        itemCount: lineItems.length,
        totalCents,
      },
    });

    return {
      orderId,
      whatsappLink,
      totalPrice: Price.fromCents(totalCents).toDisplay(),
      summary: buildOrderSummary(lineItems),
    };
  }
}

function validateRequiredOptions(
  product: { id: string; options: { name: string; required: boolean }[] },
  item: { productId: string; selectedOptions: Record<string, string> },
): void {
  for (const option of product.options) {
    if (!option.required) {
      continue;
    }
    const value = item.selectedOptions[option.name];
    if (value === undefined || value.trim() === "") {
      throw new MissingRequiredOptionError(item.productId, option.name);
    }
  }
}

function buildOrderSummary(lineItems: OrderLineItem[]): string {
  return lineItems
    .map((line) => {
      const options = Object.values(line.selectedOptions);
      const suffix = options.length > 0 ? ` (${options.join(", ")})` : "";
      return `${line.quantity}x ${line.productName}${suffix}`;
    })
    .join(", ");
}
