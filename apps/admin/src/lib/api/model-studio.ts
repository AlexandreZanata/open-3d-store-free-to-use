import type {
  BulkPrepriceResponse,
  ModelPart,
  ModelProcessingJobResponse,
} from "@print3d/shared-types";

import { adminFetch, adminPost } from "./client";

export function fetchModelJob(jobId: string): Promise<ModelProcessingJobResponse> {
  return adminFetch(`/model-jobs/${jobId}`);
}

export function bulkPrepriceProducts(): Promise<BulkPrepriceResponse> {
  return adminPost("/products/bulk-preprice", {});
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export type ModelJobWaitResult = {
  parts: ModelPart[];
  previewUrl: string | null;
};

/** Poll until job completes or fails (RabbitMQ worker must be running). */
export async function waitForModelJob(
  jobId: string,
  maxAttempts = 60,
  intervalMs = 2000,
): Promise<ModelJobWaitResult> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data } = await fetchModelJob(jobId);
    if (data.status === "completed") {
      return { parts: data.parts, previewUrl: data.previewUrl };
    }
    if (data.status === "failed") {
      throw new Error(data.errorMessage ?? "Model processing failed");
    }
    await sleep(intervalMs);
  }
  throw new Error("Model processing timed out — is the worker running?");
}
