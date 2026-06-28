import cookie from "@fastify/cookie";
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
  await app.register(cookie);

  app.decorate(
    "requireAdmin",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await attachAdminUser(request, container);
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
        sameSite: "strict",
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
): Promise<void> {
  const rawToken = request.cookies[ADMIN_SESSION_COOKIE];
  if (rawToken === undefined || rawToken.length === 0) {
    return;
  }

  try {
    const admin = await container.admin.getCurrentAdmin.execute(
      hashSessionToken(rawToken),
    );
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
