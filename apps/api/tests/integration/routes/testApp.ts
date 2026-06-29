import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { FastifyInstance } from "fastify";

import { loadConfig } from "../../../src/config.js";
import {
  createContainer,
  destroyContainer,
  type AppContainer,
} from "../../../src/container.js";
import { buildServer } from "../../../src/http/server.js";

let uploadTempDir: string | undefined;

export async function createTestApp(): Promise<{
  app: FastifyInstance;
  container: AppContainer;
}> {
  uploadTempDir = await mkdtemp(path.join(os.tmpdir(), "print3d-upload-test-"));
  const config = loadConfig({
    ...process.env,
    NODE_ENV: "test",
    MODEL_FILES_BASE_PATH: uploadTempDir,
  });
  const container = await createContainer(config);
  await container.redis.flushDb();
  const app = await buildServer(container);
  await app.ready();
  return { app, container };
}

export async function closeTestApp(
  app: FastifyInstance,
  container: AppContainer,
): Promise<void> {
  await app.close();
  await destroyContainer(container);
  if (uploadTempDir) {
    await rm(uploadTempDir, { recursive: true, force: true });
    uploadTempDir = undefined;
  }
}
