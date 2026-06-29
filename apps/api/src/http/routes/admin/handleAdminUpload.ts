import type { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import type { AppContainer } from "../../../container.js";
import { handleAdminError, sendAdminProblem } from "../../errors/handleAdminError.js";
import { handleUploadError } from "../../errors/handleUploadError.js";
import { parseUploadMultipart } from "./parseUploadMultipart.js";

export async function handleAdminUpload(
  request: FastifyRequest,
  reply: FastifyReply,
  container: AppContainer,
): Promise<void> {
  let parsed;
  try {
    parsed = await parseUploadMultipart(request);
  } catch (error) {
    if (error instanceof ZodError) {
      handleAdminError(error, request, reply);
      return;
    }
    if (error instanceof Error && error.message === "MISSING_UPLOAD_FILE") {
      sendAdminProblem(reply, request.locale ?? "en", 400, "bad-request", "badRequest");
      return;
    }
    sendAdminProblem(reply, request.locale ?? "en", 400, "bad-request", "badRequest");
    return;
  }

  try {
    const uploaded = await container.admin.uploadAsset.execute({
      adminId: request.adminUser!.id,
      kind: parsed.kind,
      filename: parsed.filename,
      mimeType: parsed.mimeType,
      data: parsed.data,
    });
    await reply.status(201).send({ data: uploaded });
  } catch (error) {
    if (handleUploadError(error, request, reply, parsed.kind)) {
      return;
    }
    if (handleAdminError(error, request, reply)) {
      return;
    }
    throw error;
  }
}
