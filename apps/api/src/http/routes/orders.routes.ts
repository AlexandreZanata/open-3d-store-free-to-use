import type { FastifyInstance } from "fastify";
import { z } from "zod";

import {
  MissingRequiredOptionError,
  ProductNotFoundError,
  ProductNotOrderableError,
} from "../../application/errors/ApplicationErrors.js";
import type { AppContainer } from "../../container.js";
import { sendProblem } from "../errors/problemDetails.js";
import { captureOrderRouteSchema } from "../openapi/routeSchemas.js";

const captureOrderBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
        selectedOptions: z.record(z.string()),
      }),
    )
    .min(1),
  customerName: z.string().optional(),
  customerNote: z.string().optional(),
});

export async function registerOrderRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.post(
    "/orders/capture",
    {
      schema: captureOrderRouteSchema,
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const parsed = captureOrderBodySchema.safeParse(request.body);
      if (!parsed.success) {
        sendProblem(
          reply,
          request.locale,
          422,
          "validation-failed",
          "validationFailed",
        );
        return;
      }

      try {
        const data = await container.captureOrder.execute(parsed.data);
        return reply.status(201).send({ data });
      } catch (error) {
        if (error instanceof ProductNotFoundError) {
          sendProblem(
            reply,
            request.locale,
            404,
            "not-found",
            "productNotFoundCapture",
            { productId: extractId(error.message) },
          );
          return;
        }
        if (error instanceof ProductNotOrderableError) {
          sendProblem(
            reply,
            request.locale,
            422,
            "not-orderable",
            "productNotOrderable",
            { productId: extractId(error.message) },
          );
          return;
        }
        if (error instanceof MissingRequiredOptionError) {
          const match = error.message.match(
            /Missing required option '(.+)' for product (.+)$/,
          );
          sendProblem(
            reply,
            request.locale,
            422,
            "validation-failed",
            "missingRequiredOption",
            {
              optionName: match?.[1] ?? "",
              productId: match?.[2] ?? "",
            },
          );
          return;
        }
        throw error;
      }
    },
  );
}

function extractId(message: string): string {
  const parts = message.split(": ");
  return parts[1] ?? "";
}
