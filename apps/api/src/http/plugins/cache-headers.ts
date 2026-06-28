import type { FastifyInstance } from "fastify";

export async function registerCacheHeaders(
  app: FastifyInstance,
): Promise<void> {
  app.addHook("onSend", async (request, reply, payload) => {
    if (request.cacheMaxAge !== undefined) {
      reply.header("Cache-Control", `public, max-age=${request.cacheMaxAge}`);
    }
    return payload;
  });
}
