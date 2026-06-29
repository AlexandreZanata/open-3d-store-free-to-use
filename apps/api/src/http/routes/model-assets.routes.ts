import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import path from "node:path";

import type { FastifyInstance, FastifyRequest } from "fastify";

import type { AppContainer } from "../../container.js";
import { buildSseCorsHeaders, isAllowedCorsOrigin } from "../plugins/cors.js";

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".3mf": "model/3mf",
  ".stl": "model/stl",
};

function resolveModelFilePath(basePath: string, wildcard: string): string | null {
  const segments = wildcard.split(/[/\\]/);
  if (segments.some((segment) => segment === ".." || segment === ".")) {
    return null;
  }

  const normalized = path.normalize(wildcard).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolute = path.resolve(basePath, normalized);
  const base = path.resolve(basePath);
  if (!absolute.startsWith(`${base}${path.sep}`) && absolute !== base) {
    return null;
  }
  return absolute;
}

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

function applyAssetCorsHeaders(
  request: FastifyRequest,
  reply: { header: (name: string, value: string) => void },
  container: AppContainer,
): void {
  const origin = request.headers.origin;
  if (origin !== undefined) {
    const corsHeaders = buildSseCorsHeaders(origin, container.config);
    if (Object.keys(corsHeaders).length > 0) {
      for (const [name, value] of Object.entries(corsHeaders)) {
        reply.header(name, value);
      }
    } else if (isAllowedCorsOrigin(origin, container.config)) {
      reply.header("Access-Control-Allow-Origin", origin);
      reply.header("Vary", "Origin");
    } else if (
      (container.config.NODE_ENV === "development" || container.config.NODE_ENV === "test") &&
      (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
    ) {
      reply.header("Access-Control-Allow-Origin", origin);
      reply.header("Vary", "Origin");
    }
  }
  reply.header("Cross-Origin-Resource-Policy", "cross-origin");
}

export async function registerModelAssetRoutes(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  app.get("/models/*", async (request, reply) => {
    const wildcard = (request.params as { "*": string })["*"];
    const filePath = resolveModelFilePath(container.config.MODEL_FILES_BASE_PATH, wildcard);
    if (filePath === null) {
      return reply.status(403).type("application/problem+json").send({
        type: "https://yourdomain.com/errors/forbidden",
        title: "Forbidden",
        status: 403,
        detail: "Invalid asset path",
      });
    }

    try {
      await access(filePath);
    } catch {
      return reply.status(404).type("application/problem+json").send({
        type: "https://yourdomain.com/errors/not-found",
        title: "Not found",
        status: 404,
        detail: "Asset not found",
      });
    }

    const fileStat = await stat(filePath);
    reply.header("Content-Length", String(fileStat.size));
    reply.header("Cache-Control", "public, max-age=3600");
    reply.type(contentTypeFor(filePath));
    applyAssetCorsHeaders(request, reply, container);

    return reply.send(createReadStream(filePath));
  });
}
