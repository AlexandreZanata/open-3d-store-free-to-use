import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";

import type { AppContainer } from "../container.js";
import { translate } from "../i18n/resolve-locale.js";
import { registerSwagger } from "./openapi/registerSwagger.js";
import { registerCors } from "./plugins/cors.js";
import { registerCacheHeaders } from "./plugins/cache-headers.js";
import { registerLocale } from "./plugins/locale.js";
import { registerRateLimit } from "./plugins/rate-limit.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerProductRoutes } from "./routes/products.routes.js";
import { registerCategoryRoutes } from "./routes/categories.routes.js";
import { registerOrderRoutes } from "./routes/orders.routes.js";

export async function buildServer(
  container: AppContainer,
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: container.config.NODE_ENV !== "test",
    trustProxy: true,
    ajv: {
      customOptions: {
        strict: false,
      },
    },
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      const { title, detail } = translate(
        request.locale ?? "pt-BR",
        "validationFailed",
      );
      reply.status(422).type("application/problem+json").send({
        type: "https://yourdomain.com/errors/validation-failed",
        title,
        status: 422,
        detail,
      });
      return;
    }

    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : undefined;

    if (statusCode === 429) {
      const { title, detail } = translate(
        request.locale ?? "pt-BR",
        "rateLimitExceeded",
      );
      reply.status(429).type("application/problem+json").send({
        type: "https://yourdomain.com/errors/rate-limit",
        title,
        status: 429,
        detail,
      });
      return;
    }

    request.log.error(error);
    reply.status(500).type("application/problem+json").send({
      type: "https://yourdomain.com/errors/internal",
      title: "Internal Server Error",
      status: 500,
      detail: "An unexpected error occurred",
    });
  });

  await registerCors(app, container.config);
  await registerSwagger(app, container.config);
  await registerLocale(app);
  await registerRateLimit(app, container.config);
  await registerCacheHeaders(app);

  await app.register(
    async (api) => {
      await registerHealthRoutes(api, container);
      await registerProductRoutes(api, container);
      await registerCategoryRoutes(api, container);
      await registerOrderRoutes(api, container);
    },
    { prefix: "/api/v1" },
  );

  return app;
}
