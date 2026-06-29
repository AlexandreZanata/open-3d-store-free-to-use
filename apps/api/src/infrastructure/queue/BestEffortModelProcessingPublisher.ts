import type { IModelProcessingQueue } from "../../application/ports/IModelProcessingQueue.js";

/** Tries async queue first; falls back when RabbitMQ is down or misconfigured. */
export class BestEffortModelProcessingPublisher implements IModelProcessingQueue {
  constructor(
    private readonly primary: IModelProcessingQueue,
    private readonly fallback: IModelProcessingQueue,
  ) {}

  async publish(jobId: string): Promise<void> {
    try {
      await this.primary.publish(jobId);
    } catch {
      await this.fallback.publish(jobId);
    }
  }
}
