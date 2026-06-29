import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../container.js";
import { handleAdminError } from "../../errors/handleAdminError.js";
import {
  adminSettingsGetRouteSchema,
  adminSettingsUpdateRouteSchema,
} from "../../openapi/adminRouteSchemas.js";
import { updateShopSettingsBodySchema } from "../../validation/adminSchemas.js";

export async function registerAdminSettingsRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  const guard = { preHandler: app.requireAdmin };

  app.get(
    "/settings",
    { schema: adminSettingsGetRouteSchema, ...guard },
    async (_request, reply) => {
      try {
        const result = await container.admin.getShopSettingsAdmin.execute();
        return reply.send(result);
      } catch (error) {
        if (handleAdminError(error, _request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.patch(
    "/settings",
    { schema: adminSettingsUpdateRouteSchema, ...guard },
    async (request, reply) => {
      const parsed = updateShopSettingsBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return handleAdminError(parsed.error, request, reply);
      }

      try {
        const result = await container.admin.updateShopSettingsAdmin.execute({
          adminId: request.adminUser!.id,
          payload: parsed.data,
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
