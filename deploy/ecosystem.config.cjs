// Galaxy of Beauty — PM2 Monorepo Production
module.exports = {
  apps: [
    {
      name: 'gob-web',
      cwd: '/app/apps/web',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      env: { NODE_ENV: 'production', PORT: 3000 },
      max_memory_restart: '1G',
    },
    {
      name: 'gob-socket',
      cwd: '/app',
      script: 'npx',
      args: 'tsx packages/api/src/socket/server.ts',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', SOCKET_PORT: 4001 },
      max_memory_restart: '512M',
    },
  ],
};
