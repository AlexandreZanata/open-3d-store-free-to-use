import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../container.js";
import { handleAdminError } from "../../errors/handleAdminError.js";
import {
  adminModelJobDetailRouteSchema,
  adminBulkPrepriceRouteSchema,
} from "../../openapi/adminModelStudioRouteSchemas.js";
import { adminIdParamSchema } from "../../validation/adminSchemas.js";

export async function registerAdminModelStudioRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  const guard = { preHandler: app.requireAdmin };

  app.get(
    "/model-jobs/:id",
    { schema: adminModelJobDetailRouteSchema, ...guard },
    async (request, reply) => {
      const { id } = adminIdParamSchema.parse(request.params);
      try {
        const result = await container.admin.getModelProcessingJob.execute({ jobId: id });
        return reply.send(result);
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.post(
    "/products/bulk-preprice",
    { schema: adminBulkPrepriceRouteSchema, ...guard },
    async (request, reply) => {
      try {
        const result = await container.admin.bulkPrepriceProducts.execute({
          adminId: request.adminUser!.id,
        });
        return reply.send(result);
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );
}
