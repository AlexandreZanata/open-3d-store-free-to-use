import type { FastifyRequest } from "fastify";

export function rateLimitLoginKey(request: FastifyRequest): string {
  return `admin-login:${request.ip}`;
}
