module.exports = {
  apps: [
    {
      name: "hyble-panel",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: "/home/hyble/apps/hyble-core/apps/hyble-panel",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
