import { readFile } from "node:fs/promises";
import path from "node:path";

import type { AdminUploadMimeType } from "@print3d/shared-types";

import type { IModelProcessingJobRepository } from "../../../domain/repositories/IModelProcessingJobRepository.js";
import type { IShopSettingsRepository } from "../../../domain/repositories/IShopSettingsRepository.js";
import { analyzeModelParts } from "../../../domain/services/modelPartAnalyzer.js";
import { DEFAULT_MATERIAL_PRICING } from "../../../domain/services/pricingCalculator.js";
import { optimizeModelPreview } from "../../../infrastructure/model/optimizeModelPreview.js";
import { ResourceNotFoundError } from "../../errors/ApplicationErrors.js";

const EXTENSION_MIME: Record<string, AdminUploadMimeType> = {
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".3mf": "model/3mf",
  ".stl": "model/stl",
};

export class ProcessModelUpload {
  constructor(
    private readonly jobs: IModelProcessingJobRepository,
    private readonly shopSettings: IShopSettingsRepository,
    private readonly modelsBasePath: string,
  ) {}

  async execute(input: { jobId: string }): Promise<void> {
    const job = await this.jobs.findById(input.jobId);
    if (job === null) {
      throw new ResourceNotFoundError("ModelProcessingJob", input.jobId);
    }

    await this.jobs.markProcessing(input.jobId);

    try {
      const data = await readFile(job.sourcePath);
      const mimeType = resolveMimeFromPath(job.sourcePath);
      const settings = await this.shopSettings.get();
      const infill = settings?.calculator.defaultInfillFactor ?? 0.2;
      const density =
        settings?.materialPricing.PLA?.densityGCm3 ??
        DEFAULT_MATERIAL_PRICING.PLA?.densityGCm3 ??
        1.24;
      const filename = path.basename(job.sourcePath);

      const parts = analyzeModelParts({
        data,
        mimeType,
        filename,
        infillFactor: infill,
        densityGCm3: density,
      });

      const preview = await optimizeModelPreview({
        sourcePath: job.sourcePath,
        mimeType,
        modelsBasePath: this.modelsBasePath,
      });

      await this.jobs.markCompleted(
        input.jobId,
        parts,
        preview ?? undefined,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Model processing failed";
      await this.jobs.markFailed(input.jobId, message);
    }
  }
}

function resolveMimeFromPath(filePath: string): AdminUploadMimeType {
  const extension = path.extname(filePath).toLowerCase();
  return EXTENSION_MIME[extension] ?? "model/gltf-binary";
}
