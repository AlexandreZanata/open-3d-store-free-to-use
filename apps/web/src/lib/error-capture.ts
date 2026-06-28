// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.

type CapturedError = Error | string;

let lastCapturedError: { error: CapturedError; at: number } | undefined;
const TTL_MS = 5_000;

function rejectionReasonToError(reason: CapturedError | object): CapturedError {
  if (reason instanceof Error) return reason;
  if (typeof reason === "string") return reason;
  return "Unhandled promise rejection";
}

function toCapturedError(value: CapturedError | Event): CapturedError {
  if (value instanceof Error) return value;
  if (typeof value === "string") return value;
  if (value instanceof ErrorEvent && value.error instanceof Error) return value.error;
  if (value instanceof PromiseRejectionEvent) {
    return rejectionReasonToError(value.reason as CapturedError | object);
  }
  return "Unhandled error event";
}

function record(error: CapturedError | Event) {
  lastCapturedError = { error: toCapturedError(error), at: Date.now() };
}

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record(event));
  globalThis.addEventListener("unhandledrejection", (event) => record(event));
}

export function consumeLastCapturedError(): CapturedError | undefined {
  if (!lastCapturedError) return undefined;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }
  const { error } = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}
