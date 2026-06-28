import type { OrderCapture } from "@print3d/shared-types";

export interface IOrderCaptureRepository {
  save(orderCapture: OrderCapture, totalCents: number): Promise<void>;
}
