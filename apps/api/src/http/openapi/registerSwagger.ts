import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

import type { AppConfig } from "../../config.js";
import * as components from "./components.js";

export async function registerSwagger(
  app: FastifyInstance,
  config: AppConfig,
): Promise<void> {
  // @fastify/swagger types target FastifyPluginCallback; Fastify 5 register overload differs.
  // @ts-expect-error — plugin/options typing mismatch (runtime works)
  await app.register(fastifySwagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "AXIS Print3D Store API",
        description:
          "Public REST API v1 for the 3D print catalog and WhatsApp order capture. " +
          "Contract: docs/api/contract.md. Errors follow RFC 7807 (Problem Details).",
        version: "1.0.0",
        contact: {
          name: "API Support",
          url: "https://github.com/AlexandreZanata/open-3d-store-free-to-use",
        },
        license: { name: "MIT", url: "https://opensource.org/licenses/MIT" },
      },
      servers: [
        {
          url: `http://127.0.0.1:${config.PORT}/api/v1`,
          description: "Local development",
        },
        { url: "https://yourdomain.com/api/v1", description: "Production" },
      ],
      tags: [
        { name: "Health", description: "Uptime and readiness" },
        { name: "Categories", description: "Product categories" },
        { name: "Products", description: "Catalog browse and search" },
        { name: "Orders", description: "Order capture via WhatsApp" },
      ],
      components: {
        schemas: {
          ProblemDetails: components.problemDetailsSchema,
          HealthResponse: components.healthResponseSchema,
          Category: components.categorySchema,
          ProductListItem: components.productListItemSchema,
          ProductDetail: components.productDetailSchema,
          Pagination: components.paginationSchema,
          CaptureOrderRequest: components.captureOrderBodySchema,
          CaptureOrderResult: components.captureOrderResultSchema,
        },
      },
    },
  });

  if (config.NODE_ENV !== "production") {
    await app.register(fastifySwaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
        displayRequestDuration: true,
      },
      staticCSP: true,
    });
  }
}
