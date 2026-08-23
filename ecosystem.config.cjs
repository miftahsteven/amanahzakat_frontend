module.exports = {
  apps: [
    {
      name: "amanahzakat-erp",
      script: "node_modules/vite/bin/vite.js",
      args: "preview --port 7037 --host 0.0.0.0",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: 7037,
      },
    },
  ],
};
