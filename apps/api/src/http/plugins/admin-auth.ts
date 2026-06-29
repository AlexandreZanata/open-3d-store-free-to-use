import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { hashSessionToken } from "../../application/services/sessionToken.js";
import type { AppConfig } from "../../config.js";
import type { AppContainer } from "../../container.js";
import {
  ADMIN_COOKIE_PATH,
  ADMIN_SESSION_COOKIE,
} from "../admin/constants.js";
import { sendAdminProblem } from "../errors/handleAdminError.js";

export async function registerAdminAuth(
  app: FastifyInstance,
  container: AppContainer,
  config: AppConfig,
): Promise<void> {
  app.decorate(
    "requireAdmin",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await attachAdminUser(request, container, config);
      if (request.adminUser !== undefined) {
        return;
      }
      sendAdminProblem(
        reply,
        request.locale ?? "en",
        401,
        "unauthorized",
        "unauthorized",
      );
    },
  );

  app.decorate(
    "setAdminSessionCookie",
    (reply: FastifyReply, token: string) => {
      reply.setCookie(ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        path: ADMIN_COOKIE_PATH,
        sameSite: config.NODE_ENV === "production" ? "strict" : "lax",
        secure: config.NODE_ENV === "production",
        maxAge: config.ADMIN_SESSION_TTL,
      });
    },
  );

  app.decorate("clearAdminSessionCookie", (reply: FastifyReply) => {
    reply.clearCookie(ADMIN_SESSION_COOKIE, { path: ADMIN_COOKIE_PATH });
  });
}

async function attachAdminUser(
  request: FastifyRequest,
  container: AppContainer,
  config: AppConfig,
): Promise<void> {
  const rawToken = request.cookies[ADMIN_SESSION_COOKIE];
  if (rawToken === undefined || rawToken.length === 0) {
    return;
  }

  try {
    const admin = await container.admin.refreshAdminSession.execute({
      tokenHash: hashSessionToken(rawToken),
      sessionTtlSeconds: config.ADMIN_SESSION_TTL,
      idleTtlSeconds: config.ADMIN_SESSION_IDLE_TTL,
    });
    request.adminUser = admin;
  } catch {
    delete request.adminUser;
  }
}

export type AdminAuthDecorators = {
  requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  setAdminSessionCookie: (reply: FastifyReply, token: string) => void;
  clearAdminSessionCookie: (reply: FastifyReply) => void;
};
