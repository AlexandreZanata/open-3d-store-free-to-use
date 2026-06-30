import type {
  BulkPrepriceResponse,
  ModelPart,
  ModelProcessingJobResponse,
} from "@print3d/shared-types";

import { adminFetch, adminPost, ApiError } from "./client";

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

const INITIAL_POLL_MS = 3_000;
const MAX_POLL_MS = 8_000;

/** Poll until job completes or fails (inline fallback runs on upload when no worker). */
export async function waitForModelJob(
  jobId: string,
  maxAttempts = 40,
  fetchJob: (id: string) => Promise<ModelProcessingJobResponse> = fetchModelJob,
): Promise<ModelJobWaitResult> {
  let intervalMs = INITIAL_POLL_MS;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const { data } = await fetchJob(jobId);
      if (data.status === "completed") {
        return { parts: data.parts, previewUrl: data.previewUrl };
      }
      if (data.status === "failed") {
        throw new Error(data.errorMessage ?? "Model processing failed");
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        intervalMs = Math.min(intervalMs * 2, MAX_POLL_MS);
        await sleep(intervalMs);
        continue;
      }
      throw error;
    }

    await sleep(intervalMs);
    intervalMs = Math.min(Math.round(intervalMs * 1.25), MAX_POLL_MS);
  }

  throw new Error("Model processing timed out — retry upload or check API logs");
}
