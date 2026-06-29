import type { FastifyInstance } from "fastify";

import { hashSessionToken } from "../../application/services/sessionToken.js";
import type { AppContainer } from "../../container.js";
import {
  STORE_MAX_ACCOUNTS_PER_DEVICE,
  STORE_MAX_ACCOUNTS_PER_IP,
} from "../../container/storeUseCases.js";
import { STORE_SESSION_COOKIE } from "../store/constants.js";
import { handleStoreAuthError } from "../errors/handleStoreAuthError.js";
import { sendProblem } from "../errors/problemDetails.js";
import {
  readDeviceId,
  readVisitorIdHeader,
  storeLoginBodySchema,
  storeRegisterBodySchema,
} from "../validation/storeSchemas.js";

export async function registerStoreAuthRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.post(
    "/auth/register",
    {
      config: {
        rateLimit: { max: 10, timeWindow: "1 minute" },
      },
    },
    async (request, reply) => {
      const deviceId = readDeviceId(request.headers["x-device-id"]);
      if (deviceId === null) {
        sendProblem(reply, request.locale, 400, "validation-failed", "validationFailed");
        return;
      }

      const parsed = storeRegisterBodySchema.safeParse(request.body);
      if (!parsed.success) {
        sendProblem(reply, request.locale, 422, "validation-failed", "validationFailed");
        return;
      }

      try {
        const result = await container.store.registerStoreUser.execute({
          email: parsed.data.email,
          password: parsed.data.password,
          displayName: parsed.data.displayName,
          deviceId,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
          sessionTtlSeconds: container.config.STORE_SESSION_TTL,
          maxAccountsPerIp: STORE_MAX_ACCOUNTS_PER_IP,
          maxAccountsPerDevice: STORE_MAX_ACCOUNTS_PER_DEVICE,
          visitorId: readVisitorIdHeader(request.headers["x-visitor-id"]) ?? undefined,
          localCart: parsed.data.cart,
        });
        app.setStoreSessionCookie(reply, result.sessionToken);
        return reply.status(201).send({
          data: { ...result.user, cart: result.cart },
        });
      } catch (error) {
        if (handleStoreAuthError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.post(
    "/auth/login",
    {
      config: {
        rateLimit: { max: 10, timeWindow: "1 minute" },
      },
    },
    async (request, reply) => {
      const parsed = storeLoginBodySchema.safeParse(request.body);
      if (!parsed.success) {
        sendProblem(reply, request.locale, 422, "validation-failed", "validationFailed");
        return;
      }

      try {
        const result = await container.store.loginStoreUser.execute({
          email: parsed.data.email,
          password: parsed.data.password,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
          sessionTtlSeconds: container.config.STORE_SESSION_TTL,
          visitorId: readVisitorIdHeader(request.headers["x-visitor-id"]) ?? undefined,
          localCart: parsed.data.cart,
        });
        app.setStoreSessionCookie(reply, result.sessionToken);
        return reply.send({ data: { ...result.user, cart: result.cart } });
      } catch (error) {
        if (handleStoreAuthError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.post("/auth/logout", { preHandler: app.requireStoreUser }, async (request, reply) => {
    const rawToken = request.cookies[STORE_SESSION_COOKIE];
    if (rawToken !== undefined) {
      await container.store.logoutStoreUser.execute(hashSessionToken(rawToken));
    }
    app.clearStoreSessionCookie(reply);
    return reply.status(204).send();
  });
}
