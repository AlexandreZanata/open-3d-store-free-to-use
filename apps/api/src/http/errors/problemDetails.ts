import type { FastifyReply } from "fastify";

import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import { translate } from "../../i18n/resolve-locale.js";

const ERROR_BASE_URL = "https://yourdomain.com/errors";

export type ProblemDetailKey =
  | "productNotFound"
  | "validationFailed"
  | "productNotOrderable"
  | "missingRequiredOption"
  | "productNotFoundCapture"
  | "rateLimitExceeded";

export function sendProblem(
  reply: FastifyReply,
  locale: SupportedLocale,
  status: number,
  type: string,
  messageKey: ProblemDetailKey,
  params: Record<string, string> = {},
): void {
  const { title, detail } = translate(locale, messageKey, params);
  reply.status(status).type("application/problem+json").send({
    type: `${ERROR_BASE_URL}/${type}`,
    title,
    status,
    detail,
  });
}
