import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { ApiError } from "@/lib/api/client";
import { waitForModelJob } from "@/lib/api/model-studio";

describe("waitForModelJob", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns completed job parts without extra polling", async () => {
    const fetchJob = vi.fn().mockResolvedValue({
      data: {
        id: "job-1",
        status: "completed",
        parts: [{ id: "p1", name: "Part 1", volumeCm3: 1, weightGrams: 2 }],
        previewUrl: "/models/3d/preview.glb",
        errorMessage: null,
      },
    });

    await expect(waitForModelJob("job-1", 3, fetchJob)).resolves.toEqual({
      parts: [{ id: "p1", name: "Part 1", volumeCm3: 1, weightGrams: 2 }],
      previewUrl: "/models/3d/preview.glb",
    });
    expect(fetchJob).toHaveBeenCalledTimes(1);
  });

  it("backs off when the API returns 429", async () => {
    const fetchJob = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiError(429, { title: "Too Many Requests", status: 429, type: "x", detail: "x" }),
      )
      .mockResolvedValueOnce({
        data: {
          id: "job-1",
          status: "completed",
          parts: [],
          previewUrl: null,
          errorMessage: null,
        },
      });

    const resultPromise = waitForModelJob("job-1", 3, fetchJob);
    await vi.runAllTimersAsync();
    await expect(resultPromise).resolves.toEqual({ parts: [], previewUrl: null });
    expect(fetchJob).toHaveBeenCalledTimes(2);
  });
});
