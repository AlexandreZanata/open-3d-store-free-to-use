import type { ModelPart, ModelProcessingJobStatus } from "@print3d/shared-types";

export type ModelProcessingJobRecord = {
  id: string;
  status: ModelProcessingJobStatus;
  sourceUrl: string;
  sourcePath: string;
  previewUrl: string | null;
  previewPath: string | null;
  parts: ModelPart[];
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateModelProcessingJobInput = {
  sourceUrl: string;
  sourcePath: string;
};

export interface IModelProcessingJobRepository {
  create(input: CreateModelProcessingJobInput): Promise<ModelProcessingJobRecord>;
  findById(id: string): Promise<ModelProcessingJobRecord | null>;
  markProcessing(id: string): Promise<void>;
  markCompleted(
    id: string,
    parts: ModelPart[],
    preview?: { previewUrl: string; previewPath: string },
  ): Promise<void>;
  markFailed(id: string, errorMessage: string): Promise<void>;
}
