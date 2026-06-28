import { loadConfig } from "./config.js";
import { createContainer, destroyContainer } from "./container.js";
import { buildServer } from "./http/server.js";

const config = loadConfig();
const container = await createContainer(config);
const app = await buildServer(container);

const host = "127.0.0.1";
await app.listen({ port: config.PORT, host });
app.log.info(`API listening on http://${host}:${config.PORT}`);

const shutdown = async () => {
  await app.close();
  await destroyContainer(container);
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
