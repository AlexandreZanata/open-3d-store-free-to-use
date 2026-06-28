import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import {
  CategoryHasActiveProductsError,
  InvalidCredentialsError,
  ProductHasOrderReferencesError,
  ResourceNotFoundError,
  SlugConflictError,
  UnauthorizedError,
  ValidationError,
} from "../../application/errors/ApplicationErrors.js";
import { DomainError } from "../../domain/errors/DomainError.js";
import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import { sendProblem, type ProblemDetailKey } from "./problemDetails.js";

export function sendAdminProblem(
  reply: FastifyReply,
  locale: SupportedLocale,
  status: number,
  type: string,
  messageKey: ProblemDetailKey,
  params: Record<string, string> = {},
): void {
  sendProblem(reply, locale, status, type, messageKey, params);
}

export function handleAdminError(
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- runtime error boundary
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
): boolean {
  const locale = request.locale ?? "en";

  if (error instanceof ZodError || error instanceof ValidationError) {
    sendAdminProblem(reply, locale, 422, "validation-failed", "validationFailed");
    return true;
  }
  if (error instanceof DomainError) {
    sendAdminProblem(reply, locale, 422, "validation-failed", "validationFailed");
    return true;
  }
  if (error instanceof InvalidCredentialsError) {
    sendAdminProblem(reply, locale, 401, "unauthorized", "invalidCredentials");
    return true;
  }
  if (error instanceof UnauthorizedError) {
    sendAdminProblem(reply, locale, 401, "unauthorized", "unauthorized");
    return true;
  }
  if (error instanceof ResourceNotFoundError) {
    const message = String(error.message);
    sendAdminProblem(reply, locale, 404, "not-found", "resourceNotFound", {
      resource: extractResource(message),
      id: extractId(message),
    });
    return true;
  }
  if (error instanceof SlugConflictError) {
    sendAdminProblem(reply, locale, 409, "conflict", "slugConflict", {
      slug: extractSlug(String(error.message)),
    });
    return true;
  }
  if (error instanceof ProductHasOrderReferencesError) {
    sendAdminProblem(
      reply,
      locale,
      409,
      "conflict",
      "productHasOrderReferences",
      { productId: extractId(String(error.message)) },
    );
    return true;
  }
  if (error instanceof CategoryHasActiveProductsError) {
    sendAdminProblem(
      reply,
      locale,
      409,
      "conflict",
      "categoryHasActiveProducts",
      { categoryId: extractId(String(error.message)) },
    );
    return true;
  }

  return false;
}

function extractId(message: string): string {
  const parts = message.split(": ");
  return parts[1] ?? "";
}

function extractResource(message: string): string {
  const match = message.match(/^(\w+) not found:/);
  return match?.[1] ?? "Resource";
}

function extractSlug(message: string): string {
  const parts = message.split(": ");
  return parts[1] ?? "";
}
