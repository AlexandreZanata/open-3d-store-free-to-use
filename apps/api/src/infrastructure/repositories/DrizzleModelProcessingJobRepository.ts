import { eq } from "drizzle-orm";

import type { ModelPart } from "@print3d/shared-types";

import type {
  CreateModelProcessingJobInput,
  IModelProcessingJobRepository,
  ModelProcessingJobRecord,
} from "../../domain/repositories/IModelProcessingJobRepository.js";
import type { Database } from "../db/client.js";
import { modelProcessingJobs } from "../db/schema.js";

function mapRow(row: typeof modelProcessingJobs.$inferSelect): ModelProcessingJobRecord {
  return {
    id: row.id,
    status: row.status as ModelProcessingJobRecord["status"],
    sourceUrl: row.sourceUrl,
    sourcePath: row.sourcePath,
    previewUrl: row.previewUrl,
    previewPath: row.previewPath,
    parts: row.parts as ModelPart[],
    errorMessage: row.errorMessage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class DrizzleModelProcessingJobRepository implements IModelProcessingJobRepository {
  constructor(private readonly db: Database) {}

  async create(input: CreateModelProcessingJobInput): Promise<ModelProcessingJobRecord> {
    const rows = await this.db
      .insert(modelProcessingJobs)
      .values({
        sourceUrl: input.sourceUrl,
        sourcePath: input.sourcePath,
      })
      .returning();
    return mapRow(rows[0]!);
  }

  async findById(id: string): Promise<ModelProcessingJobRecord | null> {
    const rows = await this.db
      .select()
      .from(modelProcessingJobs)
      .where(eq(modelProcessingJobs.id, id))
      .limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  }

  async markProcessing(id: string): Promise<void> {
    await this.db
      .update(modelProcessingJobs)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(modelProcessingJobs.id, id));
  }

  async markCompleted(
    id: string,
    parts: ModelPart[],
    preview?: { previewUrl: string; previewPath: string },
  ): Promise<void> {
    await this.db
      .update(modelProcessingJobs)
      .set({
        status: "completed",
        parts,
        errorMessage: null,
        previewUrl: preview?.previewUrl ?? null,
        previewPath: preview?.previewPath ?? null,
        updatedAt: new Date(),
      })
      .where(eq(modelProcessingJobs.id, id));
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.db
      .update(modelProcessingJobs)
      .set({ status: "failed", errorMessage, updatedAt: new Date() })
      .where(eq(modelProcessingJobs.id, id));
  }
}
