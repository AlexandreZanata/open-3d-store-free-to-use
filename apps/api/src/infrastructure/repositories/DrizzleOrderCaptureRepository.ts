import type { IOrderCaptureRepository } from "../../domain/repositories/IOrderCaptureRepository.js";
import type { OrderCapture } from "@print3d/shared-types";
import type { Database } from "../db/client.js";
import { orderCaptures } from "../db/schema.js";

export class DrizzleOrderCaptureRepository implements IOrderCaptureRepository {
  constructor(private readonly db: Database) {}

  async save(orderCapture: OrderCapture, totalCents: number): Promise<void> {
    await this.db.insert(orderCaptures).values({
      id: orderCapture.id,
      items: orderCapture.items,
      customerName: orderCapture.customerName ?? null,
      customerNote: orderCapture.customerNote ?? null,
      totalCents,
      whatsappLink: orderCapture.whatsappLink,
      capturedAt: orderCapture.capturedAt,
    });
  }
}
