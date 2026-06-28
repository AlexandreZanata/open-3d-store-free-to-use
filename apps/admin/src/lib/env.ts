type ViteEnvKey = "VITE_API_BASE_URL" | "VITE_ASSETS_BASE_URL";

function readProcessEnv(key: ViteEnvKey): string | undefined {
  if (typeof process === "undefined") return undefined;
  const nodeValue = process.env[key];
  return typeof nodeValue === "string" && nodeValue.length > 0 ? nodeValue : undefined;
}

function readViteEnv(key: ViteEnvKey): string | undefined {
  const value = import.meta.env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function readEnvString(key: ViteEnvKey): string | undefined {
  return readViteEnv(key) ?? readProcessEnv(key);
}
