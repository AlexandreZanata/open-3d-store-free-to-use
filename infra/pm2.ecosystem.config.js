/**
 * PM2 ecosystem — production API + TanStack Start SSR web.
 * API loads secrets via Node --env-file (apps/api/.env).
 * Default API port 3101 — avoids conflict with other apps on 3001.
 *
 * Usage:
 *   pm2 start infra/pm2.ecosystem.config.js --env production
 *   pm2 startup && pm2 save
 */

module.exports = {
  apps: [
    {
      name: "print3d-api",
      cwd: "/var/www/print3d",
      script: "./apps/api/dist/main.js",
      node_args: "--env-file=./apps/api/.env",
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "900M",
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "print3d-web",
      cwd: "/var/www/print3d",
      script: "pnpm",
      args: "--filter @print3d/web start",
      interpreter: "none",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "512M",
      env_production: {
        NODE_ENV: "production",
      },
    },
    {
      name: "print3d-admin",
      cwd: "/var/www/print3d",
      script: "pnpm",
      args: "--filter @print3d/admin preview",
      interpreter: "none",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "384M",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
