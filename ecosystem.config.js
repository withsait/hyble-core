/**
 * PM2 Ecosystem Configuration
 * Production deployment configuration for all Hyble apps
 */

module.exports = {
  apps: [
    // ==========================================
    // Core Application (Backend & Admin)
    // ==========================================
    {
      name: 'hyble-core',
      cwd: './apps/core',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000,
      },
      error_file: './logs/core-error.log',
      out_file: './logs/core-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },

    // ==========================================
    // Gateway (Landing & Portfolio)
    // ==========================================
    {
      name: 'hyble-gateway',
      cwd: './apps/gateway',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
      },
      error_file: './logs/gateway-error.log',
      out_file: './logs/gateway-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
    },

    // ==========================================
    // Digital (Corporate Vertical)
    // ==========================================
    {
      name: 'hyble-digital',
      cwd: './apps/digital',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3002,
      },
      error_file: './logs/digital-error.log',
      out_file: './logs/digital-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
    },

    // ==========================================
    // Studios (Gaming Vertical)
    // ==========================================
    {
      name: 'hyble-studios',
      cwd: './apps/studios',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3003,
      },
      error_file: './logs/studios-error.log',
      out_file: './logs/studios-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
    },

    // ==========================================
    // Console (User Panel)
    // ==========================================
    {
      name: 'hyble-console',
      cwd: './apps/console',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3004,
      },
      error_file: './logs/console-error.log',
      out_file: './logs/console-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
    },
  ],

  // ==========================================
  // Deployment Configuration
  // ==========================================
  deploy: {
    production: {
      user: 'root',
      host: '178.63.138.97',
      ref: 'origin/main',
      repo: 'git@github.com:hyble/hyble-core.git',
      path: '/home/hyble/apps/hyble-core',
      'pre-deploy-local': '',
      'post-deploy':
        'pnpm install --frozen-lockfile && pnpm db:migrate && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
    staging: {
      user: 'root',
      host: '178.63.138.97',
      ref: 'origin/staging',
      repo: 'git@github.com:hyble/hyble-core.git',
      path: '/home/hyble/apps/hyble-core-staging',
      'post-deploy':
        'pnpm install && pnpm db:push && pnpm build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging',
      },
    },
  },
};
