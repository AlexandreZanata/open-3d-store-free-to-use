import type { FastifyInstance } from "fastify";

import { loadConfig } from "../../../src/config.js";
import {
  createContainer,
  destroyContainer,
  type AppContainer,
} from "../../../src/container.js";
import { buildServer } from "../../../src/http/server.js";

export async function createTestApp(): Promise<{
  app: FastifyInstance;
  container: AppContainer;
}> {
  const config = loadConfig({
    ...process.env,
    NODE_ENV: "test",
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
}
