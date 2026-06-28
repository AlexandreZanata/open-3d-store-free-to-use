import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../container.js";
import { handleAdminError } from "../../errors/handleAdminError.js";
import {
  adminOrderDetailRouteSchema,
  adminOrderListRouteSchema,
} from "../../openapi/adminRouteSchemas.js";
import {
  adminIdParamSchema,
  adminOrderListQuerySchema,
} from "../../validation/adminSchemas.js";

export async function registerAdminOrderRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  const guard = { preHandler: app.requireAdmin };

  app.get(
    "/orders",
    { schema: adminOrderListRouteSchema, ...guard },
    async (request, reply) => {
      const query = adminOrderListQuerySchema.parse(request.query);
      const dateRange = {
        ...(query.from !== undefined ? { from: new Date(query.from) } : {}),
        ...(query.to !== undefined ? { to: new Date(query.to) } : {}),
      };

      const result = await container.admin.listOrderCaptures.execute({
        pagination: { page: query.page, limit: query.limit },
        dateRange:
          dateRange.from !== undefined || dateRange.to !== undefined
            ? dateRange
            : undefined,
      });
      return reply.send(result);
    },
  );

  app.get(
    "/orders/:id",
    { schema: adminOrderDetailRouteSchema, ...guard },
    async (request, reply) => {
      const { id } = adminIdParamSchema.parse(request.params);
      try {
        const order = await container.admin.getOrderCapture.execute({
          orderId: id,
        });
        return reply.send({ data: order });
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );
}
