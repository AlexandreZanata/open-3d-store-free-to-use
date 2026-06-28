import type { CaptureOrderInput, CaptureOrderResult } from "@print3d/shared-types";

import { apiPost } from "./client";

export async function captureOrder(input: CaptureOrderInput): Promise<CaptureOrderResult> {
  const response = await apiPost<{ data: CaptureOrderResult }>("/orders/capture", input);
  return response.data;
}
