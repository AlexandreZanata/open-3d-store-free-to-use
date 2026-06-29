import { describe, expect, it, vi } from "vitest";

import { BestEffortModelProcessingPublisher } from "../../../src/infrastructure/queue/BestEffortModelProcessingPublisher.js";
import type { IModelProcessingQueue } from "../../../src/application/ports/IModelProcessingQueue.js";

function mockQueue(publish: IModelProcessingQueue["publish"]): IModelProcessingQueue {
  return { publish };
}

describe("BestEffortModelProcessingPublisher", () => {
  it("uses primary queue when publish succeeds", async () => {
    const primary = vi.fn(async () => undefined);
    const fallback = vi.fn(async () => undefined);
    const queue = new BestEffortModelProcessingPublisher(
      mockQueue(primary),
      mockQueue(fallback),
    );

    await queue.publish("job-1");

    expect(primary).toHaveBeenCalledWith("job-1");
    expect(fallback).not.toHaveBeenCalled();
  });

  it("falls back when primary queue publish fails", async () => {
    const primary = vi.fn(async () => {
      throw new Error("ACCESS_REFUSED");
    });
    const fallback = vi.fn(async () => undefined);
    const queue = new BestEffortModelProcessingPublisher(
      mockQueue(primary),
      mockQueue(fallback),
    );

    await queue.publish("job-2");

    expect(fallback).toHaveBeenCalledWith("job-2");
  });
});
