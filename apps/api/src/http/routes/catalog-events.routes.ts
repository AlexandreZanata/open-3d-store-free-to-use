import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../container.js";
import { buildSseCorsHeaders } from "../plugins/cors.js";
import { catalogEventsRouteSchema } from "../openapi/catalogEventsRouteSchema.js";
import { createCatalogSseConnection } from "../../infrastructure/realtime/CatalogEventHub.js";

export async function registerCatalogEventRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.get("/catalog/events", { schema: catalogEventsRouteSchema }, async (request, reply) => {
    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      ...buildSseCorsHeaders(request.headers.origin, container.config),
    });
    reply.raw.write(": connected\n\n");

    const connection = createCatalogSseConnection(
      (chunk) => {
        reply.raw.write(chunk);
      },
      () => {
        reply.raw.end();
      },
    );

    container.catalogEventHub.register(connection);
    request.raw.on("close", () => {
      container.catalogEventHub.unregister(connection.id);
      connection.close();
    });
  });
}
