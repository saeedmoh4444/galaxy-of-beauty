/**
 * W3-7 — the web socket URL fallback always appended `:4001` to the
 * hostname, but the prod compose publishes NO host port for the socket
 * container: in production the socket rides the app origin (nginx proxies
 * /socket.io). Any deploy without NEXT_PUBLIC_SOCKET_URL set silently
 * pointed the client at a closed port.
 *
 * resolveSocketUrl is the pure resolution rule behind the fix: standard
 * ports (80/443/empty — i.e. served through the reverse proxy) resolve to
 * same-origin; anything else (dev servers) keeps the direct :4001 port.
 */
import { describe, expect, it } from 'vitest';
import { resolveSocketUrl } from './socketUrl';

describe('resolveSocketUrl (W3-7)', () => {
  it('returns the configured URL verbatim when provided', () => {
    expect(
      resolveSocketUrl(
        { protocol: 'https:', hostname: 'app.example.com', port: '443' },
        'https://realtime.example.com',
      ),
    ).toBe('https://realtime.example.com');
  });

  it('resolves to same-origin on an empty port (default scheme port)', () => {
    expect(resolveSocketUrl({ protocol: 'https:', hostname: 'app.example.com', port: '' })).toBe(
      'https://app.example.com',
    );
  });

  it('resolves to same-origin on port 80', () => {
    expect(resolveSocketUrl({ protocol: 'http:', hostname: 'app.example.com', port: '80' })).toBe(
      'http://app.example.com',
    );
  });

  it('resolves to same-origin on port 443', () => {
    expect(resolveSocketUrl({ protocol: 'https:', hostname: 'app.example.com', port: '443' })).toBe(
      'https://app.example.com',
    );
  });

  it('keeps the direct :4001 port on dev-style ports', () => {
    expect(resolveSocketUrl({ protocol: 'http:', hostname: 'localhost', port: '3000' })).toBe(
      'http://localhost:4001',
    );
    expect(resolveSocketUrl({ protocol: 'http:', hostname: '192.168.1.5', port: '8083' })).toBe(
      'http://192.168.1.5:4001',
    );
  });

  it('preserves the protocol (http vs https)', () => {
    expect(resolveSocketUrl({ protocol: 'http:', hostname: 'dev.local', port: '5173' })).toContain(
      'http:',
    );
    expect(
      resolveSocketUrl({ protocol: 'https:', hostname: 'app.example.com', port: '' }),
    ).toContain('https:');
  });
});
