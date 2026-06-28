import type { FastifyInstance, FastifyRequest } from "fastify";

import { resolveHttpLocale } from "../../i18n/resolve-locale.js";

function readAcceptLanguage(header: string | string[] | undefined): string | undefined {
  return Array.isArray(header) ? header[0] : header;
}

function readQueryLocale(query: FastifyRequest["query"]): string | undefined {
  if (typeof query !== "object" || query === null || !("locale" in query)) {
    return undefined;
  }
  const locale = query.locale;
  return typeof locale === "string" ? locale : undefined;
}

export async function registerLocale(app: FastifyInstance): Promise<void> {
  app.addHook("onRequest", async (request) => {
    const acceptLanguage = readAcceptLanguage(request.headers["accept-language"]);
    request.locale = resolveHttpLocale(acceptLanguage, readQueryLocale(request.query));
  });
}
