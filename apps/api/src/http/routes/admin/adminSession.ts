import type { FastifyRequest } from "fastify";

import { ADMIN_SESSION_COOKIE } from "../../admin/constants.js";
import { hashSessionToken } from "../../../application/services/sessionToken.js";

export function readSessionTokenHash(request: FastifyRequest): string | null {
  const raw = request.cookies[ADMIN_SESSION_COOKIE];
  if (raw === undefined || raw.length === 0) {
    return null;
  }
  return hashSessionToken(raw);
}
