module.exports = {
  apps: [
    {
      name: "hyble-web",
      script: "node_modules/.bin/next",
      args: "start -p 3001",
      cwd: "/home/hyble/apps/hyble-core/apps/hyble-web",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
