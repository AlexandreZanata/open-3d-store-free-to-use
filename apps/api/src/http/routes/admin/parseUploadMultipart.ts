import type { MultipartFile } from "@fastify/multipart";
import type { FastifyRequest } from "fastify";

import type { AdminUploadKind } from "@print3d/shared-types";

import { adminUploadKindSchema } from "../../validation/adminSchemas.js";

export type ParsedUploadMultipart = {
  kind: AdminUploadKind;
  filename: string;
  mimeType: string;
  data: Buffer;
};

function readKindValue(part: MultipartFile["fields"][string] | undefined): string | undefined {
  if (part === undefined) {
    return undefined;
  }
  if (typeof part === "object" && "value" in part) {
    return String(part.value);
  }
  return undefined;
}

export async function parseUploadMultipart(
  request: FastifyRequest,
): Promise<ParsedUploadMultipart> {
  let kindValue: string | undefined;
  let filename = "";
  let mimeType = "";
  let data: Buffer | null = null;

  const parts = request.parts();
  for await (const part of parts) {
    if (part.type === "field" && part.fieldname === "kind") {
      kindValue = String(part.value);
      continue;
    }

    if (part.type === "file" && part.fieldname === "file") {
      filename = part.filename;
      mimeType = part.mimetype;
      data = await part.toBuffer();
      const nestedKind = readKindValue(part.fields.kind);
      if (nestedKind !== undefined) {
        kindValue = nestedKind;
      }
    }
  }

  if (data === null) {
    throw new Error("MISSING_UPLOAD_FILE");
  }

  const kindParsed = adminUploadKindSchema.safeParse(kindValue);
  if (!kindParsed.success) {
    throw kindParsed.error;
  }

  return {
    kind: kindParsed.data,
    filename,
    mimeType,
    data,
  };
}
