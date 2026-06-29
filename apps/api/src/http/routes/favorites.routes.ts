import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { ProductNotFoundError } from "../../application/errors/ApplicationErrors.js";
import type { AppContainer } from "../../container.js";
import { sendProblem } from "../errors/problemDetails.js";

const visitorIdSchema = z.string().uuid();
const productIdSchema = z.string().uuid();

function readVisitorId(request: FastifyRequest, reply: FastifyReply): string | null {
  const header = request.headers["x-visitor-id"];
  const value = Array.isArray(header) ? header[0] : header;
  const parsed = visitorIdSchema.safeParse(value);
  if (!parsed.success) {
    sendProblem(reply, request.locale, 400, "validation-failed", "validationFailed");
    return null;
  }
  return parsed.data;
}

export async function registerFavoriteRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.get("/favorites", async (request, reply) => {
    const visitorId = readVisitorId(request, reply);
    if (visitorId === null) {
      return;
    }
    const data = await container.favoriteProducts.list(visitorId, request.locale);
    return reply.send(data);
  });

  app.post(
    "/favorites/:productId",
    {
      config: {
        rateLimit: { max: 60, timeWindow: "1 minute" },
      },
    },
    async (request, reply) => {
      const visitorId = readVisitorId(request, reply);
      if (visitorId === null) {
        return;
      }
      const params = z.object({ productId: productIdSchema }).safeParse(request.params);
      if (!params.success) {
        sendProblem(reply, request.locale, 422, "validation-failed", "validationFailed");
        return;
      }
      try {
        const data = await container.favoriteProducts.add(
          visitorId,
          params.data.productId,
          request.locale,
        );
        return reply.status(201).send({ data });
      } catch (error) {
        if (error instanceof ProductNotFoundError) {
          sendProblem(reply, request.locale, 404, "not-found", "productNotFound");
          return;
        }
        throw error;
      }
    },
  );

  app.delete(
    "/favorites/:productId",
    {
      config: {
        rateLimit: { max: 60, timeWindow: "1 minute" },
      },
    },
    async (request, reply) => {
      const visitorId = readVisitorId(request, reply);
      if (visitorId === null) {
        return;
      }
      const params = z.object({ productId: productIdSchema }).safeParse(request.params);
      if (!params.success) {
        sendProblem(reply, request.locale, 422, "validation-failed", "validationFailed");
        return;
      }
      const data = await container.favoriteProducts.remove(visitorId, params.data.productId);
      return reply.send({ data });
    },
  );
}
