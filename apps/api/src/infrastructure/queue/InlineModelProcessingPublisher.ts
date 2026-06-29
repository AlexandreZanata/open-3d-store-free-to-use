import type { ProcessModelUpload } from "../../application/use-cases/admin/ProcessModelUpload.js";
import type { IModelProcessingQueue } from "../../application/ports/IModelProcessingQueue.js";

/** Runs mesh extraction in-process (dev / queue unavailable). */
export class InlineModelProcessingPublisher implements IModelProcessingQueue {
  constructor(private readonly processor: ProcessModelUpload) {}

  async publish(jobId: string): Promise<void> {
    await this.processor.execute({ jobId });
  }
}
