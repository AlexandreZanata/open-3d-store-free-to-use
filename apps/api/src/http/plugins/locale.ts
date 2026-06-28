import type { FastifyInstance } from "fastify";

import { resolveHttpLocale } from "../../i18n/resolve-locale.js";

export async function registerLocale(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (request) => {
    const query = request.query as { locale?: string };
    const header = request.headers["accept-language"];
    const acceptLanguage = Array.isArray(header) ? header[0] : header;
    request.locale = resolveHttpLocale(acceptLanguage, query.locale);
  });
}
