import http from 'http';
import { initializeSocket } from './index';
import { getEnv } from '../lib/env';

/**
 * Standalone Socket.IO server for real-time events.
 *
 * Port: configurable via SOCKET_PORT env var (default 4001).
 * Why separate from Next.js:
 *   - Next.js 14 App Router does not support custom WebSocket servers
 *   - Socket.IO needs long-lived connections, Next.js is request/response
 *   - Separate process allows independent scaling
 *   - Future: migrate to tRPC WebSocket subscriptions for unified stack
 *
 * Health check: GET /health → { status: "ok" }
 * Run: pnpm --filter @galaxy/api socket
 */
const env = getEnv();
const PORT = parseInt(process.env['SOCKET_PORT'] || '4001', 10);

const httpServer = http.createServer((req, res) => {
  const url = req.url || '/';

  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'socket-io', uptime: process.uptime() }));
    return;
  }

  // Default response for any other HTTP request
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'socket-io' }));
});

initializeSocket(httpServer);

// Graceful shutdown
function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`[Socket] ${signal} received — shutting down...`);
  httpServer.close(() => {
    // eslint-disable-next-line no-console
    console.log('[Socket] Server closed');
    process.exit(0);
  });
  // Force exit after 10s
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

httpServer.listen(PORT, () => {
  if (process.env['NODE_ENV'] !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`[Socket] Server listening on port ${PORT}`);
  }
});
