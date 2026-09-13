// Galaxy of Beauty — PM2 Monorepo Production
//
// The APP_ROOT path is the application directory. It defaults to /app
// (the Docker container mount point). For bare-metal deployments,
// set APP_ROOT in your environment, e.g.:
//   APP_ROOT=/var/www/galaxyofbeauty pm2 start ecosystem.config.cjs

const APP_ROOT = process.env['APP_ROOT'] || '/app';

module.exports = {
  apps: [
    {
      name: 'gob-web',
      cwd: `${APP_ROOT}/apps/web`,
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3000 },
      max_memory_restart: '1G',
    },
    {
      name: 'gob-socket',
      cwd: APP_ROOT,
      script: 'npx',
      args: 'tsx packages/api/src/socket/server.ts',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', SOCKET_PORT: 4001 },
      max_memory_restart: '512M',
    },
    {
      name: 'gob-worker',
      cwd: APP_ROOT,
      script: 'npx',
      args: 'tsx packages/api/src/workers/run.ts',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '512M',
    },
  ],
};
