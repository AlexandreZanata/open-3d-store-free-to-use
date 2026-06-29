import type { FastifyReply, FastifyRequest } from "fastify";

import {
  EmailConflictError,
  RegistrationLimitError,
} from "../../application/errors/StoreAuthErrors.js";
import { InvalidCredentialsError } from "../../application/errors/ApplicationErrors.js";
import { sendProblem, type ProblemDetailKey } from "../errors/problemDetails.js";

export function handleStoreAuthError(
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- runtime error boundary
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
): boolean {
  const locale = request.locale;
  const handlers: Array<[boolean, number, string, ProblemDetailKey]> = [
    [error instanceof InvalidCredentialsError, 401, "unauthorized", "invalidCredentials"],
    [error instanceof EmailConflictError, 409, "conflict", "emailConflict"],
    [error instanceof RegistrationLimitError, 403, "forbidden", "registrationLimit"],
  ];

  for (const [match, status, type, key] of handlers) {
    if (match) {
      sendProblem(reply, locale, status, type, key);
      return true;
    }
  }
  return false;
}
