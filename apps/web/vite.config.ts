import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolvePreviewAllowedHosts } from "./vitePreviewHosts";

function resolveDevApiOrigin(env: Record<string, string>): string {
  if (env.VITE_DEV_API_ORIGIN) {
    return env.VITE_DEV_API_ORIGIN.replace(/\/$/, "");
  }

  const apiBase = env.VITE_API_BASE_URL ?? "http://127.0.0.1:6200/api/v1";
  return apiBase.replace(/\/api\/v1\/?$/, "");
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = resolveDevApiOrigin(env);

  return {
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      tanstackStart({
        server: { entry: "server" },
      }),
      viteReact(),
    ],
    server: {
      host: "127.0.0.1",
      port: 6201,
      strictPort: true,
      proxy: {
        "/models": {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: "127.0.0.1",
      port: 4173,
      strictPort: true,
      allowedHosts: resolvePreviewAllowedHosts(env.VITE_ASSETS_BASE_URL),
    },
  };
});
