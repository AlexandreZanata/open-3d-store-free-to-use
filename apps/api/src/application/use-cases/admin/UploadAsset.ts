import type { AdminUploadKind } from "@print3d/shared-types";

import type { IAssetStorage } from "../../ports/IAssetStorage.js";
import type { IModelProcessingQueue } from "../../ports/IModelProcessingQueue.js";
import type { IModelProcessingJobRepository } from "../../../domain/repositories/IModelProcessingJobRepository.js";
import type { AuditLogger } from "../../services/AuditLogger.js";

export type UploadAssetInput = {
  adminId: string;
  kind: AdminUploadKind;
  filename: string;
  mimeType: string;
  data: Buffer;
};

export type UploadAssetResult = {
  url: string;
  path: string;
  sourceUrl: string;
  sizeBytes: number;
  mimeType: string;
  kind: AdminUploadKind;
  jobId?: string;
  previewUrl?: string | null;
};

export class UploadAsset {
  constructor(
    private readonly storage: IAssetStorage,
    private readonly audit: AuditLogger,
    private readonly modelJobs: IModelProcessingJobRepository,
    private readonly modelQueue: IModelProcessingQueue,
  ) {}

  async execute(input: UploadAssetInput): Promise<UploadAssetResult> {
    const saved = await this.storage.saveUpload({
      kind: input.kind,
      filename: input.filename,
      mimeType: input.mimeType,
      data: input.data,
    });

    let jobId: string | undefined;
    let previewUrl: string | null = null;
    if (input.kind === "model") {
      const job = await this.modelJobs.create({
        sourceUrl: saved.url,
        sourcePath: this.storage.resolvePathFromPublicUrl(saved.url),
      });
      await this.modelQueue.publish(job.id);
      jobId = job.id;
      const completed = await this.modelJobs.findById(job.id);
      previewUrl = completed?.previewUrl ?? null;
    }

    const viewerUrl = previewUrl ?? saved.url;

    await this.audit.log({
      adminUserId: input.adminId,
      action: "admin.upload.created",
      resourceType: "upload",
      resourceId: jobId ?? null,
      metadata: {},
    });

    return {
      url: input.kind === "model" ? viewerUrl : saved.url,
      path: viewerUrl,
      sourceUrl: saved.url,
      sizeBytes: saved.sizeBytes,
      mimeType: saved.mimeType,
      kind: saved.kind,
      ...(jobId !== undefined ? { jobId } : {}),
      ...(input.kind === "model" ? { previewUrl } : {}),
    };
  }
}
