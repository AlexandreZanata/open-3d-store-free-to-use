import type { ProblemDetails } from "@print3d/shared-types";

import { readEnvString } from "../env";

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
    "Accept-Language": "en",
    ...init?.headers,
  };
}

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(adminUrl(path), {
    ...init,
    credentials: "include",
    headers: buildHeaders(init),
  });

  if (!response.ok) {
    let problem: ProblemDetails;
    try {
      problem = (await response.json()) as ProblemDetails;
    } catch {
      problem = {
        type: "https://yourdomain.com/errors/unknown",
        title: response.statusText || "Request failed",
        status: response.status,
        detail: `HTTP ${response.status}`,
      };
    }
    throw new ApiError(response.status, problem);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function adminPost<T>(path: string, body: object, init?: RequestInit): Promise<T> {
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

export async function adminPatch<T>(path: string, body: object, init?: RequestInit): Promise<T> {
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

export async function adminDelete(path: string, init?: RequestInit): Promise<void> {
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
