import type { FastifyInstance } from "fastify";

import type { AppConfig } from "../../../config.js";
import type { AppContainer } from "../../../container.js";
import { registerAdminAuth } from "../../plugins/admin-auth.js";
import { registerAdminAuthRoutes } from "./auth.routes.js";
import { registerAdminCategoryRoutes } from "./categories.routes.js";
import { registerAdminOrderRoutes } from "./orders.routes.js";
import { registerAdminProductRoutes } from "./products.routes.js";
import { registerAdminUploadRoutes } from "./uploads.routes.js";
import { registerAdminSettingsRoutes } from "./settings.routes.js";
import { registerAdminStoreUserRoutes } from "./store-users.routes.js";

export async function registerAdminRoutes(
  app: FastifyInstance,
  container: AppContainer,
  config: AppConfig,
): Promise<void> {
  await registerAdminAuth(app, container, config);
  await registerAdminAuthRoutes(app, container);
  await registerAdminProductRoutes(app, container);
  await registerAdminCategoryRoutes(app, container);
  await registerAdminOrderRoutes(app, container);
  await registerAdminUploadRoutes(app, container);
  await registerAdminSettingsRoutes(app, container);
  await registerAdminStoreUserRoutes(app, container);
}
