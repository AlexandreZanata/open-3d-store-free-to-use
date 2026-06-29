import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function resolveDevApiOrigin(env: Record<string, string>): string {
  if (env.VITE_DEV_API_ORIGIN) {
    return env.VITE_DEV_API_ORIGIN.replace(/\/$/, "");
  }

  const assetsBase = env.VITE_ASSETS_BASE_URL;
  if (assetsBase && !assetsBase.includes("localhost:5174") && !assetsBase.includes("127.0.0.1:5174")) {
    return assetsBase.replace(/\/$/, "");
  }

  const apiBase = env.VITE_API_BASE_URL ?? "http://127.0.0.1:3001/api/v1";
  return apiBase.replace(/\/api\/v1\/?$/, "");
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = resolveDevApiOrigin(env);

  return {
    plugins: [
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      tsconfigPaths(),
      tailwindcss(),
      viteReact(),
    ],
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        "/models": {
          target: apiOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
