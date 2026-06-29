/**
 * PM2 ecosystem template — copy to pm2.ecosystem.config.js on the VPS (gitignored).
 * See docs/infrastructure/deployment.md
 *
 * Usage on server:
 *   cp infra/pm2.ecosystem.config.example.js infra/pm2.ecosystem.config.js
 *   # edit cwd / node_args paths for your app directory
 *   pm2 start infra/pm2.ecosystem.config.js --env production
 */

module.exports = {
  apps: [
    {
      name: "print3d-api",
      cwd: "/var/www/APP_NAME",
      script: "./apps/api/dist/main.js",
      node_args: "--env-file=./apps/api/.env",
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "900M",
      env_production: {
        NODE_ENV: "production",
        PORT: 3101,
        HOST: "127.0.0.1",
      },
    },
    {
      name: "print3d-web",
      cwd: "/var/www/APP_NAME",
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
      cwd: "/var/www/APP_NAME",
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
