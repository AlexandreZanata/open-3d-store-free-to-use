import type { FastifyInstance, InjectOptions } from "fastify";

import { seedAdminUser } from "../../../../scripts/seedAdmin.js";
import { ADMIN_SESSION_COOKIE } from "../../../../src/http/admin/constants.js";

export const TEST_ADMIN_EMAIL = "admin@test.local";
export const TEST_ADMIN_PASSWORD = "test-password-12";

export async function seedTestAdmin(connectionString: string): Promise<void> {
  process.env.NODE_ENV = "test";
  process.env.ADMIN_BOOTSTRAP_EMAIL = TEST_ADMIN_EMAIL;
  process.env.ADMIN_BOOTSTRAP_PASSWORD = TEST_ADMIN_PASSWORD;
  await seedAdminUser(connectionString);
}

export async function loginTestAdmin(app: FastifyInstance): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/admin/auth/login",
    payload: {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(`Admin login failed: ${response.body}`);
  }

  const setCookie = response.headers["set-cookie"];
  const rawHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = rawHeader?.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`));
  if (match?.[1] === undefined) {
    throw new Error("Admin session cookie missing from login response");
  }
  return `${ADMIN_SESSION_COOKIE}=${match[1]}`;
}

export function withAdminCookie(
  cookie: string,
  options: InjectOptions = {},
): InjectOptions {
  return {
    ...options,
    headers: {
      ...options.headers,
      cookie,
    },
  };
}

export function buildMultipartPayload(input: {
  kind: string;
  filename: string;
  mimeType: string;
  data: Buffer;
}): { payload: Buffer; contentType: string } {
  const boundary = "----print3d-test-boundary";
  const prefix = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="kind"\r\n\r\n` +
      `${input.kind}\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${input.filename}"\r\n` +
      `Content-Type: ${input.mimeType}\r\n\r\n`,
  );
  const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
  return {
    payload: Buffer.concat([prefix, input.data, suffix]),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

/** Browser FormData order: file before kind — server must accept both orders. */
export function buildMultipartPayloadFileFirst(input: {
  kind: string;
  filename: string;
  mimeType: string;
  data: Buffer;
}): { payload: Buffer; contentType: string } {
  const boundary = "----print3d-test-boundary";
  const prefix = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${input.filename}"\r\n` +
      `Content-Type: ${input.mimeType}\r\n\r\n`,
  );
  const middle = Buffer.from(
    `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="kind"\r\n\r\n` +
      `${input.kind}\r\n`,
  );
  const suffix = Buffer.from(`--${boundary}--\r\n`);
  return {
    payload: Buffer.concat([prefix, input.data, middle, suffix]),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}
