import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../container.js";
import { handleAdminError, sendAdminProblem } from "../../errors/handleAdminError.js";
import { adminUploadRouteSchema } from "../../openapi/adminRouteSchemas.js";
import { adminUploadKindSchema } from "../../validation/adminSchemas.js";

export async function registerAdminUploadRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  await app.register(multipart, {
    limits: { fileSize: container.config.UPLOAD_MAX_BYTES },
  });

  app.post(
    "/uploads",
    { schema: adminUploadRouteSchema, preHandler: app.requireAdmin },
    async (request, reply) => {
      let file;
      try {
        file = await request.file();
      } catch {
        sendAdminProblem(
          reply,
          request.locale ?? "en",
          400,
          "bad-request",
          "badRequest",
        );
        return;
      }

      if (file === undefined) {
        sendAdminProblem(
          reply,
          request.locale ?? "en",
          400,
          "bad-request",
          "badRequest",
        );
        return;
      }

      const kindField = file.fields.kind;
      const kindValue =
        kindField !== undefined &&
        typeof kindField === "object" &&
        "value" in kindField
          ? String(kindField.value)
          : undefined;

      const kindParsed = adminUploadKindSchema.safeParse(kindValue);
      if (!kindParsed.success) {
        return handleAdminError(kindParsed.error, request, reply);
      }

      const buffer = await file.toBuffer();
      try {
        const uploaded = await container.admin.uploadAsset.execute({
          adminId: request.adminUser!.id,
          kind: kindParsed.data,
          filename: file.filename,
          mimeType: file.mimetype,
          data: buffer,
        });
        return reply.status(201).send({ data: uploaded });
      } catch (error) {
        if (error instanceof Error && error.message.includes("MIME")) {
          sendAdminProblem(
            reply,
            request.locale ?? "en",
            422,
            "validation-failed",
            "validationFailed",
          );
          return;
        }
        if (error instanceof Error && error.message.includes("max size")) {
          sendAdminProblem(
            reply,
            request.locale ?? "en",
            422,
            "validation-failed",
            "validationFailed",
          );
          return;
        }
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );
}
