import multipart from "@fastify/multipart";
import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../container.js";
import { adminUploadRouteSchema } from "../../openapi/adminRouteSchemas.js";
import { handleAdminUpload } from "./handleAdminUpload.js";

export async function registerAdminUploadRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  await app.register(multipart, {
    limits: { fileSize: container.config.MODEL_UPLOAD_MAX_BYTES },
  });

  app.post(
    "/uploads",
    { schema: adminUploadRouteSchema, preHandler: app.requireAdmin },
    async (request, reply) => handleAdminUpload(request, reply, container),
  );
}
