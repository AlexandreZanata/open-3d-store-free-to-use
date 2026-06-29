import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../container.js";
import { sendProblem } from "../errors/problemDetails.js";
import {
  storeSaveCartBodySchema,
  storeUpdateProfileBodySchema,
} from "../validation/storeSchemas.js";

export async function registerStoreMeRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.get("/me", { preHandler: app.requireStoreUser }, async (request, reply) => {
    return reply.send({
      data: {
        ...request.storeUser!,
        cart: request.storeCart ?? [],
      },
    });
  });

  app.patch("/me", { preHandler: app.requireStoreUser }, async (request, reply) => {
    const parsed = storeUpdateProfileBodySchema.safeParse(request.body);
    if (!parsed.success) {
      sendProblem(reply, request.locale, 422, "validation-failed", "validationFailed");
      return;
    }

    const user = await container.store.updateStoreProfile.execute(
      request.storeUser!.id,
      parsed.data.displayName,
    );
    return reply.send({
      data: {
        ...user,
        cart: request.storeCart ?? [],
      },
    });
  });

  app.put("/me/cart", { preHandler: app.requireStoreUser }, async (request, reply) => {
    const parsed = storeSaveCartBodySchema.safeParse(request.body);
    if (!parsed.success) {
      sendProblem(reply, request.locale, 422, "validation-failed", "validationFailed");
      return;
    }

    const cart = await container.store.saveStoreCart.execute(
      request.storeUser!.id,
      parsed.data.cart,
    );
    return reply.send({ data: { cart } });
  });
}
