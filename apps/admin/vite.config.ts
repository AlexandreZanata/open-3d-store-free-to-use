import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function resolveDevApiOrigin(env: Record<string, string>): string {
  if (env.VITE_DEV_API_ORIGIN) {
    return env.VITE_DEV_API_ORIGIN.replace(/\/$/, "");
  }

  const apiBase = env.VITE_API_BASE_URL ?? "/api/v1";
  if (apiBase.startsWith("/")) {
    return env.VITE_DEV_API_ORIGIN?.replace(/\/$/, "") ?? "http://127.0.0.1:6200";
  }
  return apiBase.replace(/\/api\/v1\/?$/, "");
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = resolveDevApiOrigin(env);
  const adminBase = env.VITE_ADMIN_BASE_PATH?.replace(/\/$/, "") ?? "";
  const base = adminBase ? `${adminBase}/` : "/";

  return {
    base,
    plugins: [
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      tsconfigPaths(),
      tailwindcss(),
      viteReact(),
    ],
    server: {
      host: "127.0.0.1",
      port: 6202,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiOrigin,
          changeOrigin: true,
        },
        "/models": {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
