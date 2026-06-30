import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { hashSessionToken } from "../../application/services/sessionToken.js";
import type { AppConfig } from "../../config.js";
import type { AppContainer } from "../../container.js";
import { STORE_COOKIE_PATH, STORE_SESSION_COOKIE } from "../store/constants.js";
import { sendProblem } from "../errors/problemDetails.js";
import {
  sessionCookieSameSite,
  sessionCookieSecureForRequest,
} from "../sessionCookieOptions.js";

export async function registerStoreAuth(
  app: FastifyInstance,
  container: AppContainer,
  config: AppConfig,
): Promise<void> {
  app.decorate(
    "requireStoreUser",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await attachStoreUser(request, container, config);
      if (request.storeUser !== undefined) {
        return;
      }
      sendProblem(reply, request.locale, 401, "unauthorized", "unauthorized");
    },
  );

  app.decorate("setStoreSessionCookie", (reply: FastifyReply, token: string) => {
    reply.setCookie(STORE_SESSION_COOKIE, token, {
      httpOnly: true,
      path: STORE_COOKIE_PATH,
      sameSite: sessionCookieSameSite(config),
      secure: sessionCookieSecureForRequest(reply.request, config),
      maxAge: config.STORE_SESSION_TTL,
    });
  });

  app.decorate("clearStoreSessionCookie", (reply: FastifyReply) => {
    reply.clearCookie(STORE_SESSION_COOKIE, { path: STORE_COOKIE_PATH });
  });

  app.addHook("onRequest", async (request) => {
    await attachStoreUser(request, container, config);
  });
}

async function attachStoreUser(
  request: FastifyRequest,
  container: AppContainer,
  config: AppConfig,
): Promise<void> {
  const rawToken = request.cookies[STORE_SESSION_COOKIE];
  if (rawToken === undefined || rawToken.length === 0) {
    return;
  }

  try {
    const result = await container.store.refreshStoreSession.execute({
      tokenHash: hashSessionToken(rawToken),
      sessionTtlSeconds: config.STORE_SESSION_TTL,
      idleTtlSeconds: config.STORE_SESSION_IDLE_TTL,
    });
    request.storeUser = result.user;
    request.storeCart = result.cart;
    request.storeCheckoutNote = result.checkoutNote;
  } catch {
    delete request.storeUser;
    delete request.storeCart;
    delete request.storeCheckoutNote;
  }
}
