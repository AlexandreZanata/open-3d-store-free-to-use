import type { ProblemDetails } from "@print3d/shared-types";

import { readEnvString } from "../env";
import {
  notifyAdminSessionExpired,
  shouldRetryAdminSession,
  tryRefreshAdminSession,
} from "./adminSessionCoordinator";

const DEFAULT_API_BASE = "http://localhost:3001/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails;

  constructor(status: number, problem: ProblemDetails) {
    super(problem.title);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

export type AdminRequestOptions = RequestInit & {
  skipSessionRetry?: boolean;
};

export function getApiBaseUrl(): string {
  return readEnvString("VITE_API_BASE_URL") ?? DEFAULT_API_BASE;
}

function adminUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}/admin${normalized}`;
}

function buildHeaders(init?: RequestInit): HeadersInit {
  return {
    Accept: "application/json",
    "Accept-Language": "pt-BR",
    ...init?.headers,
  };
}

async function parseProblem(response: Response): Promise<ProblemDetails> {
  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return {
      type: "https://yourdomain.com/errors/unknown",
      title: response.statusText || "Request failed",
      status: response.status,
      detail: `HTTP ${response.status}`,
    };
  }
}

async function throwApiError(response: Response): Promise<never> {
  const problem = await parseProblem(response);
  throw new ApiError(response.status, problem);
}

export async function adminRequest(
  path: string,
  init?: AdminRequestOptions,
): Promise<Response> {
  const { skipSessionRetry = false, ...requestInit } = init ?? {};
  let response = await fetch(adminUrl(path), {
    ...requestInit,
    credentials: "include",
    headers: buildHeaders(requestInit),
  });

  if (
    response.status === 401 &&
    !skipSessionRetry &&
    shouldRetryAdminSession(path)
  ) {
    const refreshed = await tryRefreshAdminSession();
    if (refreshed) {
      response = await fetch(adminUrl(path), {
        ...requestInit,
        credentials: "include",
        headers: buildHeaders(requestInit),
      });
    }
    if (response.status === 401) {
      notifyAdminSessionExpired();
    }
  }

  return response;
}

export async function adminFetch<T>(path: string, init?: AdminRequestOptions): Promise<T> {
  const response = await adminRequest(path, init);

  if (!response.ok) {
    await throwApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function adminPost<T>(path: string, body: object, init?: AdminRequestOptions): Promise<T> {
  return adminFetch<T>(path, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(body),
  });
}

export async function adminPatch<T>(path: string, body: object, init?: AdminRequestOptions): Promise<T> {
  return adminFetch<T>(path, {
    ...init,
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(body),
  });
}

export async function adminDelete(path: string, init?: AdminRequestOptions): Promise<void> {
  await adminFetch<void>(path, { ...init, method: "DELETE" });
}

export function isUnauthorizedError(error: ApiError): boolean {
  return error.status === 401;
}

export function isValidationError(error: ApiError): boolean {
  return error.status === 422;
}

export function getFieldErrors(
  problem: ProblemDetails & { errors?: Record<string, string[]> },
): Record<string, string> {
  const errors = problem.errors;
  if (!errors) return {};

  const mapped: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    const first = messages[0];
    if (first) mapped[field] = first;
  }
  return mapped;
}
