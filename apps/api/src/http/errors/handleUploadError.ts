import type { FastifyReply, FastifyRequest } from "fastify";

import type { SupportedLocale } from "../../domain/value-objects/Locale.js";
import { sendAdminProblem } from "./handleAdminError.js";

export function handleUploadError(
  // eslint-disable-next-line @typescript-eslint/no-restricted-types -- runtime error boundary
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
  kind: string,
): boolean {
  const locale = (request.locale ?? "en") as SupportedLocale;

  if (error instanceof Error) {
    const message = error.message;

    if (message.startsWith("MIME type not allowed:")) {
      const mimeType = message.replace("MIME type not allowed: ", "");
      sendAdminProblem(reply, locale, 422, "validation-failed", "uploadMimeNotAllowed", {
        mimeType,
      });
      return true;
    }

    if (message.includes("max size")) {
      sendAdminProblem(reply, locale, 422, "validation-failed", "uploadTooLarge", { kind });
      return true;
    }

    if (message.includes("Input buffer") || message.includes("unsupported image format")) {
      sendAdminProblem(reply, locale, 422, "validation-failed", "uploadInvalidImage");
      return true;
    }

    const errno = error as NodeJS.ErrnoException;
    if (errno.code === "EACCES" || errno.code === "ENOENT" || errno.code === "EROFS") {
      sendAdminProblem(reply, locale, 500, "internal", "uploadStorageFailed");
      return true;
    }
  }

  return false;
}
