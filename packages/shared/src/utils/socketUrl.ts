import { SOCKET_DEFAULT_PORT } from '../constants';

export interface SocketUrlParts {
  protocol: string; // 'http:' | 'https:' (window.location.protocol)
  hostname: string;
  port: string; // '' for the scheme default, else the explicit port
}

/**
 * W3-7 — resolve the Socket.IO server URL for a web client.
 *
 * The old fallback always appended `:4001` to the hostname, but the prod
 * compose publishes NO host port for the socket container: in production
 * the socket rides the app origin (nginx proxies /socket.io to the socket
 * container). Any deploy without NEXT_PUBLIC_SOCKET_URL set therefore
 * pointed the client at a closed port and realtime silently died.
 *
 * Rule:
 *  - an explicitly configured URL always wins (NEXT_PUBLIC_SOCKET_URL)
 *  - a standard port (''/80/443 — i.e. served through the reverse proxy)
 *    resolves to the same origin, where nginx proxies /socket.io
 *  - anything else (dev servers) keeps the direct :4001 connection
 */
export function resolveSocketUrl(parts: SocketUrlParts, configured?: string): string {
  if (configured) return configured;

  const { protocol, hostname, port } = parts;
  const behindReverseProxy = port === '' || port === '80' || port === '443';
  return behindReverseProxy
    ? `${protocol}//${hostname}`
    : `${protocol}//${hostname}:${SOCKET_DEFAULT_PORT}`;
}
