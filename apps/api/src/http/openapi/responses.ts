import { problemDetailsSchema } from "./components.js";

type ProblemExample = {
  type: string;
  title: string;
  status: number;
  detail: string;
};

export function problemContent(example: ProblemExample) {
  return {
    "application/json": {
      schema: problemDetailsSchema,
      example,
    },
    "application/problem+json": {
      schema: problemDetailsSchema,
      example,
    },
  };
}

export const acceptLanguageHeader = {
  name: "Accept-Language",
  in: "header" as const,
  required: false,
  schema: { type: "string", enum: ["en", "pt-BR"] },
  description: "Preferred locale for catalog fields and error messages. Default: pt-BR.",
};

export const localeQueryParam = {
  name: "locale",
  in: "query" as const,
  required: false,
  schema: { type: "string", enum: ["en", "pt-BR"] },
  description: "Optional locale override (takes precedence over Accept-Language).",
};

export const internalErrorResponse = {
  description: "Unexpected server error",
  content: problemContent({
    type: "https://yourdomain.com/errors/internal",
    title: "Internal Server Error",
    status: 500,
    detail: "An unexpected error occurred",
  }),
};

export const validationErrorResponse = {
  description: "Request validation failed (invalid query or body)",
  content: problemContent({
    type: "https://yourdomain.com/errors/validation-failed",
    title: "Validation failed",
    status: 422,
    detail: "One or more fields are invalid",
  }),
};

export const rateLimitResponse = {
  description: "Rate limit exceeded (global 100/min or route-specific limit)",
  content: problemContent({
    type: "https://yourdomain.com/errors/rate-limit",
    title: "Too many requests",
    status: 429,
    detail: "Rate limit exceeded. Try again later.",
  }),
};
