import type { FastifyContextConfig, FastifyInstance } from "fastify";

import type { AppConfig } from "../../../config.js";
import type { AppContainer } from "../../../container.js";
import { ADMIN_RATE_LIMIT } from "../../plugins/rate-limit.js";
import { registerAdminAuth } from "../../plugins/admin-auth.js";
import { registerAdminAuthRoutes } from "./auth.routes.js";
import { registerAdminCategoryRoutes } from "./categories.routes.js";
import { registerAdminOrderRoutes } from "./orders.routes.js";
import { registerAdminProductRoutes } from "./products.routes.js";
import { registerAdminUploadRoutes } from "./uploads.routes.js";
import { registerAdminSettingsRoutes } from "./settings.routes.js";
import { registerAdminStoreUserRoutes } from "./store-users.routes.js";
import { registerAdminModelStudioRoutes } from "./model-studio.routes.js";

function isLoginRateLimit(routeConfig: FastifyContextConfig | undefined): boolean {
  if (routeConfig === undefined) {
    return false;
  }
  const rateLimit = routeConfig.rateLimit;
  return (
    typeof rateLimit === "object" &&
    rateLimit !== null &&
    "max" in rateLimit &&
    rateLimit.max === 5
  );
}

export async function registerAdminRoutes(
  app: FastifyInstance,
  container: AppContainer,
  config: AppConfig,
): Promise<void> {
  if (config.NODE_ENV === "production") {
    app.addHook("onRoute", (routeOptions) => {
      const existing = routeOptions.config?.rateLimit;
      if (existing === false || isLoginRateLimit(routeOptions.config)) {
        return;
      }
      routeOptions.config = {
        ...routeOptions.config,
        rateLimit: ADMIN_RATE_LIMIT,
      };
    });
  }

  await registerAdminAuth(app, container, config);
  await registerAdminAuthRoutes(app, container);
  await registerAdminProductRoutes(app, container);
  await registerAdminCategoryRoutes(app, container);
  await registerAdminOrderRoutes(app, container);
  await registerAdminUploadRoutes(app, container);
  await registerAdminSettingsRoutes(app, container);
  await registerAdminStoreUserRoutes(app, container);
  await registerAdminModelStudioRoutes(app, container);
}
