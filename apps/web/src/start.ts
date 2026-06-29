import { createStart, createMiddleware } from "@tanstack/react-start";

import { applyAppLocale } from "./i18n";
import { renderErrorPage } from "./lib/error-page";
import { resolveRequestLocale } from "./lib/resolve-locale";

const localeMiddleware = createMiddleware().server(async ({ next, request }) => {
  const locale = resolveRequestLocale(
    request.headers.get("accept-language"),
    request.headers.get("cookie"),
  );
  applyAppLocale(locale);
  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [localeMiddleware, errorMiddleware],
}));
