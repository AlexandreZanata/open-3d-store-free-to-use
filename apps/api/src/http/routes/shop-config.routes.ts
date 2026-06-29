import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../container.js";
import { shopConfigRouteSchema } from "../openapi/catalogRouteSchemas.js";

export async function registerShopConfigRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.get("/shop/config", { schema: shopConfigRouteSchema }, async (_request, reply) => {
    const result = await container.getShopConfig.execute();
    return reply.send(result);
  });
}
