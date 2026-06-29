import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { ProductNotFoundError } from "../../application/errors/ApplicationErrors.js";
import type { FavoriteOwner } from "../../application/use-cases/FavoriteProducts.js";
import type { AppContainer } from "../../container.js";
import { sendProblem } from "../errors/problemDetails.js";
import { readVisitorIdHeader } from "../validation/storeSchemas.js";

const productIdSchema = z.string().uuid();

function resolveFavoriteOwner(request: FastifyRequest, reply: FastifyReply): FavoriteOwner | null {
  if (request.storeUser !== undefined) {
    return { type: "user", userId: request.storeUser.id };
  }
  const visitorId = readVisitorIdHeader(request.headers["x-visitor-id"]);
  if (visitorId === null) {
    sendProblem(reply, request.locale, 400, "validation-failed", "validationFailed");
    return null;
  }
  return { type: "visitor", visitorId };
}

export async function registerFavoriteRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.get("/favorites", async (request, reply) => {
    const owner = resolveFavoriteOwner(request, reply);
    if (owner === null) {
      return;
    }
    const data = await container.favoriteProducts.list(owner, request.locale);
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
      const owner = resolveFavoriteOwner(request, reply);
      if (owner === null) {
        return;
      }
      const params = z.object({ productId: productIdSchema }).safeParse(request.params);
      if (!params.success) {
        sendProblem(reply, request.locale, 422, "validation-failed", "validationFailed");
        return;
      }
      try {
        const data = await container.favoriteProducts.add(
          owner,
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
      const owner = resolveFavoriteOwner(request, reply);
      if (owner === null) {
        return;
      }
      const params = z.object({ productId: productIdSchema }).safeParse(request.params);
      if (!params.success) {
        sendProblem(reply, request.locale, 422, "validation-failed", "validationFailed");
        return;
      }
      const data = await container.favoriteProducts.remove(owner, params.data.productId);
      return reply.send({ data });
    },
  );
}
