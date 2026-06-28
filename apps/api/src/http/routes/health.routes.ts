import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../container.js";

const startTime = Date.now();

export async function registerHealthRoutes(
  app: FastifyInstance,
  _container: AppContainer,
): Promise<void> {
  app.get("/health", async (_request, reply) => {
    return reply.send({
      status: "ok",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  });
}
