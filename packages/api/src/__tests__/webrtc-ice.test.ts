/**
 * A4 follow-up — TURN relay support: buildIceServers unit tests.
 *
 * The socket server builds the ICE server list from env (TURN_URLS,
 * TURN_USERNAME, TURN_CREDENTIAL, STUN_URLS) and ships it in the video:join
 * ack so clients don't need TURN credentials baked into their bundles.
 */
import { describe, expect, it } from 'vitest';
import { buildIceServers, DEFAULT_STUN_URLS } from '../lib/webrtc';

describe('buildIceServers', () => {
  it('returns the default public STUN pair when nothing is configured', () => {
    const servers = buildIceServers({});
    expect(servers).toEqual([{ urls: DEFAULT_STUN_URLS[0] }, { urls: DEFAULT_STUN_URLS[1] }]);
  });

  it('prepends a TURN server with credentials when fully configured', () => {
    const servers = buildIceServers({
      TURN_URLS: 'turn:turn.example.com:3478?transport=udp',
      TURN_USERNAME: 'gob',
      TURN_CREDENTIAL: 'relay-secret',
    });
    expect(servers[0]).toEqual({
      urls: 'turn:turn.example.com:3478?transport=udp',
      username: 'gob',
      credential: 'relay-secret',
    });
    // TURN + the two default STUN entries
    expect(servers).toHaveLength(3);
  });

  it('accepts multiple TURN URLs (udp + tls) as an array on one server entry', () => {
    const servers = buildIceServers({
      TURN_URLS:
        'turn:relay.example.com:3478?transport=udp,turns:relay.example.com:5349?transport=tcp',
      TURN_USERNAME: 'u',
      TURN_CREDENTIAL: 'p',
    });
    expect(servers[0]?.urls).toEqual([
      'turn:relay.example.com:3478?transport=udp',
      'turns:relay.example.com:5349?transport=tcp',
    ]);
  });

  it('omits TURN when username or credential is missing', () => {
    const withUrlOnly = buildIceServers({ TURN_URLS: 'turn:relay.example.com:3478' });
    expect(withUrlOnly).toEqual([{ urls: DEFAULT_STUN_URLS[0] }, { urls: DEFAULT_STUN_URLS[1] }]);

    const withoutCredential = buildIceServers({
      TURN_URLS: 'turn:relay.example.com:3478',
      TURN_USERNAME: 'u',
    });
    expect(withoutCredential).toEqual([
      { urls: DEFAULT_STUN_URLS[0] },
      { urls: DEFAULT_STUN_URLS[1] },
    ]);
  });

  it('replaces the STUN defaults when STUN_URLS is set', () => {
    const servers = buildIceServers({ STUN_URLS: 'stun:custom.example.com:3478' });
    expect(servers).toEqual([{ urls: 'stun:custom.example.com:3478' }]);
  });

  it('ignores blank entries and trims whitespace', () => {
    const servers = buildIceServers({
      TURN_URLS: ' , ',
      TURN_USERNAME: 'u',
      TURN_CREDENTIAL: 'p',
      STUN_URLS: ' stun:custom.example.com:3478, ',
    });
    expect(servers).toEqual([{ urls: 'stun:custom.example.com:3478' }]);
  });
});
