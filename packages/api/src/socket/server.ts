import http from 'http';
import { initializeSocket } from './index';
import { getEnv } from '../lib/env';

/**
 * Standalone Socket.IO server.
 * Run with: pnpm --filter @galaxy/api socket
 * Listens on SOCKET_PORT (default 4001).
 */
const env = getEnv();
const PORT = parseInt(process.env['SOCKET_PORT'] || '4001', 10);

const httpServer = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'socket-io' }));
});

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[Socket] Server listening on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`[Socket] CORS origin: ${env.CORS_ORIGIN}`);
});
