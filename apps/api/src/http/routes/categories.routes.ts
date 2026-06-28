import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../container.js";

export async function registerCategoryRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.get("/categories", async (request, reply) => {
    request.cacheMaxAge = 300;
    const data = await container.getCategories.execute(request.locale);
    return reply.send({ data });
  });
}
