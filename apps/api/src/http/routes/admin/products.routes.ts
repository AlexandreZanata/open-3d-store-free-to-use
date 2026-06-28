import type { CreateProductPayload, UpdateProductPayload } from "@print3d/shared-types";
import type { PrintStatus } from "@print3d/shared-types";
import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../container.js";
import { handleAdminError } from "../../errors/handleAdminError.js";
import {
  adminProductCreateRouteSchema,
  adminProductDeleteRouteSchema,
  adminProductDetailRouteSchema,
  adminProductListRouteSchema,
  adminProductUpdateRouteSchema,
} from "../../openapi/adminRouteSchemas.js";
import {
  adminIdParamSchema,
  adminProductListQuerySchema,
  createProductBodySchema,
  updateProductBodySchema,
} from "../../validation/adminSchemas.js";

export async function registerAdminProductRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  const guard = { preHandler: app.requireAdmin };

  app.get(
    "/products",
    { schema: adminProductListRouteSchema, ...guard },
    async (request, reply) => {
      const query = adminProductListQuerySchema.parse(request.query);
      const filters = {
        ...(query.status !== undefined
          ? { status: query.status as PrintStatus }
          : {}),
        ...(query.category !== undefined ? { category: query.category } : {}),
        ...(query.q !== undefined ? { q: query.q } : {}),
      };

      const result = await container.admin.listProductsAdmin.execute({
        filters,
        pagination: { page: query.page, limit: query.limit },
      });
      return reply.send(result);
    },
  );

  app.get(
    "/products/:id",
    { schema: adminProductDetailRouteSchema, ...guard },
    async (request, reply) => {
      const { id } = adminIdParamSchema.parse(request.params);
      try {
        const product = await container.admin.getProductAdmin.execute({
          productId: id,
        });
        return reply.send({ data: product });
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.post(
    "/products",
    { schema: adminProductCreateRouteSchema, ...guard },
    async (request, reply) => {
      const parsed = createProductBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return handleAdminError(parsed.error, request, reply);
      }

      try {
        const product = await container.admin.createProduct.execute({
          adminId: request.adminUser!.id,
          payload: parsed.data as CreateProductPayload,
        });
        return reply.status(201).send({ data: product });
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.patch(
    "/products/:id",
    { schema: adminProductUpdateRouteSchema, ...guard },
    async (request, reply) => {
      const { id } = adminIdParamSchema.parse(request.params);
      const parsed = updateProductBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return handleAdminError(parsed.error, request, reply);
      }

      try {
        const product = await container.admin.updateProduct.execute({
          adminId: request.adminUser!.id,
          productId: id,
          payload: parsed.data as UpdateProductPayload,
        });
        return reply.send({ data: product });
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.delete(
    "/products/:id",
    { schema: adminProductDeleteRouteSchema, ...guard },
    async (request, reply) => {
      const { id } = adminIdParamSchema.parse(request.params);
      try {
        await container.admin.deleteProduct.execute({
          adminId: request.adminUser!.id,
          productId: id,
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
