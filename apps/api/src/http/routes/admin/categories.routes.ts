import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@print3d/shared-types";
import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../container.js";
import { handleAdminError } from "../../errors/handleAdminError.js";
import {
  adminCategoryCreateRouteSchema,
  adminCategoryDeleteRouteSchema,
  adminCategoryDetailRouteSchema,
  adminCategoryListRouteSchema,
  adminCategoryUpdateRouteSchema,
} from "../../openapi/adminRouteSchemas.js";
import {
  adminIdParamSchema,
  createCategoryBodySchema,
  updateCategoryBodySchema,
} from "../../validation/adminSchemas.js";

export async function registerAdminCategoryRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  const guard = { preHandler: app.requireAdmin };

  app.get(
    "/categories",
    { schema: adminCategoryListRouteSchema, ...guard },
    async (_request, reply) => {
      const result = await container.admin.listCategoriesAdmin.execute();
      return reply.send(result);
    },
  );

  app.get(
    "/categories/:id",
    { schema: adminCategoryDetailRouteSchema, ...guard },
    async (request, reply) => {
      const { id } = adminIdParamSchema.parse(request.params);
      try {
        const category = await container.admin.getCategoryAdmin.execute({
          categoryId: id,
        });
        return reply.send({ data: category });
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.post(
    "/categories",
    { schema: adminCategoryCreateRouteSchema, ...guard },
    async (request, reply) => {
      const parsed = createCategoryBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return handleAdminError(parsed.error, request, reply);
      }

      try {
        const category = await container.admin.createCategory.execute({
          adminId: request.adminUser!.id,
          payload: parsed.data as CreateCategoryPayload,
        });
        return reply.status(201).send({ data: category });
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.patch(
    "/categories/:id",
    { schema: adminCategoryUpdateRouteSchema, ...guard },
    async (request, reply) => {
      const { id } = adminIdParamSchema.parse(request.params);
      const parsed = updateCategoryBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return handleAdminError(parsed.error, request, reply);
      }

      try {
        const category = await container.admin.updateCategory.execute({
          adminId: request.adminUser!.id,
          categoryId: id,
          payload: parsed.data as UpdateCategoryPayload,
        });
        return reply.send({ data: category });
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.delete(
    "/categories/:id",
    { schema: adminCategoryDeleteRouteSchema, ...guard },
    async (request, reply) => {
      const { id } = adminIdParamSchema.parse(request.params);
      try {
        await container.admin.deleteCategory.execute({
          adminId: request.adminUser!.id,
          categoryId: id,
        });
        return reply.status(204).send();
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );
}
