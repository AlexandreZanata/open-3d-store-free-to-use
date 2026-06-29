import type { IModelProcessingQueue } from "../../application/ports/IModelProcessingQueue.js";

export class NoOpModelProcessingPublisher implements IModelProcessingQueue {
  async publish(_jobId: string): Promise<void> {
    // Queue disabled — worker not configured.
  }
}
