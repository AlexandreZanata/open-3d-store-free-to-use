import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../container.js";
import { handleAdminError } from "../../errors/handleAdminError.js";
import {
  adminStoreUserDetailRouteSchema,
  adminStoreUserListRouteSchema,
  adminStoreUserUpdateRouteSchema,
} from "../../openapi/adminRouteSchemas.js";
import {
  adminIdParamSchema,
  adminStoreUserListQuerySchema,
  updateStoreUserAdminBodySchema,
} from "../../validation/adminSchemas.js";

export async function registerAdminStoreUserRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  const guard = { preHandler: app.requireAdmin };

  app.get(
    "/users",
    { schema: adminStoreUserListRouteSchema, ...guard },
    async (request, reply) => {
      const query = adminStoreUserListQuerySchema.parse(request.query);
      const result = await container.admin.listStoreUsersAdmin.execute({
        filters: { emailQuery: query.q },
        pagination: { page: query.page, limit: query.limit },
      });
      return reply.send(result);
    },
  );

  app.get(
    "/users/:id",
    { schema: adminStoreUserDetailRouteSchema, ...guard },
    async (request, reply) => {
      const { id } = adminIdParamSchema.parse(request.params);
      try {
        const user = await container.admin.getStoreUserAdmin.execute({ userId: id });
        return reply.send({ data: user });
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.patch(
    "/users/:id",
    { schema: adminStoreUserUpdateRouteSchema, ...guard },
    async (request, reply) => {
      const { id } = adminIdParamSchema.parse(request.params);
      const parsed = updateStoreUserAdminBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return handleAdminError(parsed.error, request, reply);
      }
      try {
        const user = await container.admin.updateStoreUserAdmin.execute({
          userId: id,
          payload: parsed.data,
        });
        return reply.send({ data: user });
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );
}
