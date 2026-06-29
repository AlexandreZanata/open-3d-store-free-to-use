import type { FastifyInstance, FastifyRequest } from "fastify";

import type { AppContainer } from "../../container.js";
import { sendProblem } from "../errors/problemDetails.js";
import {
  storeMeCartPutRouteSchema,
  storeMeGetRouteSchema,
  storeMePatchRouteSchema,
} from "../openapi/routeSchemas.js";
import {
  storeSaveCartBodySchema,
  storeUpdateProfileBodySchema,
} from "../validation/storeSchemas.js";

function buildMePayload(request: FastifyRequest) {
  return {
    ...request.storeUser!,
    cart: request.storeCart ?? [],
    checkoutNote: request.storeCheckoutNote ?? null,
  };
}

export async function registerStoreMeRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.get("/me", { schema: storeMeGetRouteSchema, preHandler: app.requireStoreUser }, async (request, reply) => {
    return reply.send({ data: buildMePayload(request) });
  });

  app.patch("/me", { schema: storeMePatchRouteSchema, preHandler: app.requireStoreUser }, async (request, reply) => {
    const parsed = storeUpdateProfileBodySchema.safeParse(request.body);
    if (!parsed.success) {
      sendProblem(reply, request.locale, 422, "validation-failed", "validationFailed");
      return;
    }

    const updated = await container.store.updateStoreProfile.execute(
      request.storeUser!.id,
      parsed.data,
    );
    return reply.send({
      data: {
        ...updated.user,
        cart: request.storeCart ?? [],
        checkoutNote: updated.checkoutNote,
      },
    });
  });

  app.put("/me/cart", { schema: storeMeCartPutRouteSchema, preHandler: app.requireStoreUser }, async (request, reply) => {
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
