/**
 * PM2 ecosystem — production API process manager.
 * See docs/infrastructure/deployment.md
 *
 * Usage: pm2 start infra/pm2.ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: "print3d-api",
      cwd: "/var/www/print3d",
      script: "./apps/api/dist/http/server.js",
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "900M",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        HOST: "127.0.0.1",
      },
    },
  ],
};
