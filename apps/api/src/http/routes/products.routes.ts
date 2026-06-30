import type { MaterialType, PrintStatus } from "@print3d/shared-types";
import { MATERIAL_TYPES } from "@print3d/shared-types";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { AppContainer } from "../../container.js";
import { sendProblem } from "../errors/problemDetails.js";
import {
  productDetailRouteSchema,
  productsListRouteSchema,
} from "../openapi/routeSchemas.js";

const materials = MATERIAL_TYPES;
const statuses = ["active", "out_of_stock", "discontinued"] as const;

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().optional(),
  material: z.enum(materials).optional(),
  status: z.enum(statuses).default("active"),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  q: z.string().optional(),
  minPrice: z.coerce.number().int().optional(),
  maxPrice: z.coerce.number().int().optional(),
});

export async function registerProductRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.get("/products", { schema: productsListRouteSchema }, async (request, reply) => {
    request.cacheMaxAge = 120;
    const query = listQuerySchema.parse(request.query);

    if (query.q !== undefined && query.q.trim() !== "") {
      const result = await container.searchProducts.execute(
        query.q,
        { page: query.page, limit: query.limit },
        request.locale,
      );
      request.cacheMaxAge = 60;
      return reply.send(result);
    }

    const filters = {
      ...(query.category !== undefined ? { category: query.category } : {}),
      ...(query.material !== undefined
        ? { material: query.material as MaterialType }
        : {}),
      status: query.status as PrintStatus,
      ...(query.featured === true ? { featured: true as const } : {}),
      ...(query.minPrice !== undefined ? { minPrice: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { maxPrice: query.maxPrice } : {}),
    };

    const result = await container.listProducts.execute(
      filters,
      { page: query.page, limit: query.limit },
      request.locale,
    );
    return reply.send(result);
  });

  app.get("/products/:slug", { schema: productDetailRouteSchema }, async (request, reply) => {
    request.cacheMaxAge = 600;
    const { slug } = request.params as { slug: string };
    const product = await container.getProductBySlug.execute(
      slug,
      request.locale,
    );

    if (product === null) {
      sendProblem(reply, request.locale, 404, "not-found", "productNotFound", {
        slug,
      });
      return;
    }

    return reply.send({ data: product });
  });
}
