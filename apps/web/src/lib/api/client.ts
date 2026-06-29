import type { JsonValue, ProblemDetails, SupportedLocale } from "@print3d/shared-types";

import { readEnvString } from "../env";
import { getActiveLocale } from "../locale";

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

function buildHeaders(locale?: SupportedLocale): HeadersInit {
  return {
    Accept: "application/json",
    "Accept-Language": locale ?? getActiveLocale(),
  };
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { locale?: SupportedLocale },
): Promise<T> {
  const { locale: localeOverride, ...requestInit } = init ?? {};
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    ...buildHeaders(localeOverride),
    ...requestInit.headers,
  };

  const response = await fetch(url, { ...requestInit, headers, cache: "no-store" });

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

export async function apiPost<T>(
  path: string,
  body: JsonValue,
  init?: RequestInit & { locale?: SupportedLocale },
): Promise<T> {
  return apiFetch<T>(path, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(body),
  });
}
