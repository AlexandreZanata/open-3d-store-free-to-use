import type { IModelProcessingJobRepository } from "../../../domain/repositories/IModelProcessingJobRepository.js";
import { ResourceNotFoundError } from "../../errors/ApplicationErrors.js";

export class GetModelProcessingJob {
  constructor(private readonly jobs: IModelProcessingJobRepository) {}

  async execute(input: { jobId: string }) {
    const job = await this.jobs.findById(input.jobId);
    if (job === null) {
      throw new ResourceNotFoundError("ModelProcessingJob", input.jobId);
    }

    return {
      data: {
        id: job.id,
        status: job.status,
        sourceUrl: job.sourceUrl,
        previewUrl: job.previewUrl,
        parts: job.parts,
        errorMessage: job.errorMessage,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      },
    };
  }
}
