import type { Env } from './env';

// ── A4 follow-up: TURN relay support ──────────────────────
//
// The socket server builds the ICE server list from env and ships it in the
// video:join ack, so clients don't need TURN credentials baked into their
// bundles. TURN relaying media (not just signaling) is what makes video
// calls work between symmetric-NAT users — plain STUN is not enough there.

export const DEFAULT_STUN_URLS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
] as const;

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

type IceEnv = Pick<Env, 'TURN_URLS' | 'TURN_USERNAME' | 'TURN_CREDENTIAL' | 'STUN_URLS'>;

function splitList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function buildIceServers(config: IceEnv): IceServerConfig[] {
  const servers: IceServerConfig[] = [];

  // TURN is only usable with credentials — a URL alone would fail at
  // negotiation time, so drop it rather than ship a broken entry.
  const turnUrls = splitList(config.TURN_URLS);
  if (turnUrls.length > 0 && config.TURN_USERNAME && config.TURN_CREDENTIAL) {
    servers.push({
      urls: turnUrls.length === 1 ? turnUrls[0]! : turnUrls,
      username: config.TURN_USERNAME,
      credential: config.TURN_CREDENTIAL,
    });
  }

  // STUN_URLS overrides the public Google pair (e.g. self-hosted STUN).
  const stunUrls = splitList(config.STUN_URLS);
  const effectiveStun = stunUrls.length > 0 ? stunUrls : [...DEFAULT_STUN_URLS];
  for (const url of effectiveStun) {
    servers.push({ urls: url });
  }

  return servers;
}
