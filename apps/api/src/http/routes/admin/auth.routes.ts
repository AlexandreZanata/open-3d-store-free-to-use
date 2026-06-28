import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../../container.js";
import { handleAdminError, sendAdminProblem } from "../../errors/handleAdminError.js";
import {
  adminLoginRouteSchema,
  adminLogoutRouteSchema,
  adminMeRouteSchema,
} from "../../openapi/adminRouteSchemas.js";
import { adminLoginBodySchema } from "../../validation/adminSchemas.js";
import { readSessionTokenHash } from "./adminSession.js";

export async function registerAdminAuthRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.post(
    "/auth/login",
    {
      schema: adminLoginRouteSchema,
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const parsed = adminLoginBodySchema.safeParse(request.body);
      if (!parsed.success) {
        sendAdminProblem(
          reply,
          request.locale ?? "en",
          422,
          "validation-failed",
          "validationFailed",
        );
        return;
      }

      try {
        const result = await container.admin.loginAdmin.execute({
          email: parsed.data.email,
          password: parsed.data.password,
          sessionTtlSeconds: container.config.ADMIN_SESSION_TTL,
          ipAddress: request.ip,
          userAgent: request.headers["user-agent"],
        });

        app.setAdminSessionCookie(reply, result.sessionToken);
        return reply.send({ data: result.admin });
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.post(
    "/auth/logout",
    { schema: adminLogoutRouteSchema, preHandler: app.requireAdmin },
    async (request, reply) => {
      const tokenHash = readSessionTokenHash(request);
      if (tokenHash === null) {
        sendAdminProblem(
          reply,
          request.locale ?? "en",
          401,
          "unauthorized",
          "unauthorized",
        );
        return;
      }

      try {
        await container.admin.logoutAdmin.execute(tokenHash);
        app.clearAdminSessionCookie(reply);
        return reply.status(204).send();
      } catch (error) {
        if (handleAdminError(error, request, reply)) {
          return;
        }
        throw error;
      }
    },
  );

  app.get(
    "/auth/me",
    { schema: adminMeRouteSchema, preHandler: app.requireAdmin },
    async (request, reply) => {
      return reply.send({ data: request.adminUser });
    },
  );
}
