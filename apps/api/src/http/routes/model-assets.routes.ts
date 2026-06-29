import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";

import type { FastifyInstance } from "fastify";

import type { AppContainer } from "../../container.js";

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
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

    reply.header("Cache-Control", "public, max-age=3600");
    reply.type(contentTypeFor(filePath));
    return reply.send(createReadStream(filePath));
  });
}
